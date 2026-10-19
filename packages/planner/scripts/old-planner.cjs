/* ==========================================================================
   AI HOME PLATFORM — planner.js
   --------------------------------------------------------------------------
   入力条件から「間取り（平面プラン）」を自動生成するエンジン。

   ・910mm（尺モジュール）のグリッド上で部屋を配置する
   ・1帖 = 910 × 1820mm = 2マス として面積を扱う
   ・構成は バンド（横帯） → アイテム（縦列） → ルーム（列内の縦積み） の三層
   ・道路側を y = 0 とし、庭側へ向かって LDK を配置する
   ・玄関バンドは「浅い列（深さ2）＋その下を通る廊下（深さ1）」で構成する。
     階段は必ずバンドの最後（x = W-2）に置くため、1階と2階の階段位置が揃う
   ・2階は1階より浅くできる（残りは下屋）
   ・配置後に隣接グラフを幅優先探索して建具（ドア）と動線を決定する
   ========================================================================== */
(function (global) {
    'use strict';

    var CELL_MM = 910;
    var CELL_M2 = 0.91 * 0.91; // 0.8281 ㎡
    var U = global.AIH.U;

    function jo2cells(jo) {
        return Math.max(1, Math.round(jo * 2));
    }
    function has(arr, v) {
        return Array.isArray(arr) && arr.indexOf(v) >= 0;
    }
    function itemMin(it) {
        return it.min == null ? 1 : it.min;
    }

    /* 「好きな家を選ぶ」で選ばれた外観デザインの案を解決する。
     未選択なら「デザイン」ステップの好みの1案目を使う。 */
    function exteriorSpecOf(v) {
        var HI = global.AIH_HOUSE_IMAGES;
        var style = v.exteriorStyle || 'モダン';
        if (HI && HI.exteriorSpec) {
            var s = HI.exteriorSpec(v.exteriorVariant || '', style);
            if (v.roofType) s.roof = v.roofType; // 「屋根形状」で選び直した場合はそちらを優先
            return s;
        }
        return {
            style: style,
            tone: 'グレー',
            roof: v.roofType || '切妻',
            material: 'サイディング',
            window: 'たて長',
            louver: true,
            eave: false,
        };
    }

    /* ==================================================================
     1. 幅のパッキング
     ================================================================== */
    function packWidths(W, items) {
        var w = items.map(function (it) {
            return U.clamp(it.w, itemMin(it), it.max || 99);
        });
        var sum = function () {
            return w.reduce(function (a, b) {
                return a + b;
            }, 0);
        };
        var guard = 0;

        while (sum() < W && guard++ < 500) {
            var best = -1,
                bestScore = -1;
            for (var i = 0; i < items.length; i++) {
                var f = items[i].flex || 0;
                if (!f || w[i] >= (items[i].max || 99)) continue;
                var sc = f / (w[i] + 1);
                if (sc > bestScore) {
                    bestScore = sc;
                    best = i;
                }
            }
            if (best < 0) {
                best = 0;
                for (var k = 1; k < items.length; k++) {
                    if ((items[k].flex || 0) > (items[best].flex || 0))
                        best = k;
                }
            }
            w[best]++;
        }
        guard = 0;
        while (sum() > W && guard++ < 500) {
            var idx = -1,
                cur = -1;
            for (var j = 0; j < items.length; j++) {
                if (w[j] <= itemMin(items[j])) continue;
                var v = (items[j].flex || 0.01) * w[j];
                if (v > cur) {
                    cur = v;
                    idx = j;
                }
            }
            if (idx < 0) break;
            w[idx]--;
        }
        return w;
    }

    /* ==================================================================
     2. バンド → 矩形への展開
     ================================================================== */
    function pushRect(out, spec, x, y, w, h, ctx) {
        var key = spec.key || spec.name;
        if (spec.merge) {
            for (var i = 0; i < out.length; i++) {
                if (out[i].key === key) {
                    out[i].rects.push({ x: x, y: y, w: w, h: h });
                    return out[i];
                }
            }
        }
        out.push({
            id: ctx.floorName + '-' + key + '-' + ctx.seq++,
            key: key,
            name: spec.name,
            type: spec.type,
            merge: !!spec.merge,
            rects: [{ x: x, y: y, w: w, h: h }],
        });
        return out[out.length - 1];
    }

    function layoutBand(band, W, y0, out, ctx) {
        var widths = packWidths(W, band.items);
        band.items.forEach(function (it, i) {
            it.__w = widths[i];
        });
        var x = 0;
        band.items.forEach(function (it, i) {
            var w = widths[i];
            it.__x = x;
            if (w <= 0) return;
            var rooms = it.rooms.filter(Boolean);

            // 固定深さの合計がバンド深さを超える場合、重要度の低い部屋（収納など）から削る
            var depths = rooms.map(function (r) {
                return r.d === 'fill' ? null : r.d;
            });
            var hasFill = depths.some(function (d) {
                return d === null;
            });
            var fixed = depths.reduce(function (a, d) {
                return a + (d || 0);
            }, 0);
            var over = fixed - band.depth + (hasFill ? 1 : 0);
            if (over > 0) {
                var order = [];
                rooms.forEach(function (r, ri) {
                    if (depths[ri] === null) return;
                    var prio =
                        r.type === 'closet' || r.type === 'storage' ? 0 : 1;
                    order.push({ i: ri, prio: prio });
                });
                order.sort(function (a, b) {
                    return a.prio - b.prio || b.i - a.i;
                });
                order.forEach(function (o) {
                    if (over <= 0) return;
                    var cut = Math.min(depths[o.i], over);
                    depths[o.i] -= cut;
                    over -= cut;
                });
            }
            var rest =
                band.depth -
                depths.reduce(function (a, d) {
                    return a + (d || 0);
                }, 0);

            var yy = y0;
            rooms.forEach(function (r, ri) {
                var d = depths[ri] === null ? rest : depths[ri];
                if (depths[ri] === null) rest = 0;
                if (d <= 0) return;
                pushRect(out, r, x, yy, w, d, ctx);
                yy += d;
            });
            x += w;
        });
    }

    /* ==================================================================
     3. 諸室プログラムの組み立て
     ================================================================== */
    function hallRoom(key, d) {
        return { key: key, name: 'ホール', type: 'hall', merge: true, d: d };
    }

    function buildProgram(v, variant) {
        var floors = Number(v.floors) || 2;
        var twoFloor = floors >= 2;
        var kids = Number(v.kidsRooms) || 0;
        var kidsJo = Number(v.kidsSize) || 5;
        var masterJo = Number(v.masterSize) || 8;
        var ldkJo = Number(v.ldkSize) || 18;

        var bathW = v.bathSize === '1坪' ? 2 : 3;
        var washW = has(v.waterOpts, '脱衣室分離') ? 3 : 2;
        var laundry = has(v.waterOpts, 'ランドリールーム');
        var pantry = has(v.waterOpts, 'パントリー');
        var wash2F = has(v.waterOpts, '2階洗面') && twoFloor;
        var sicKind = v.shoesCloset || 'なし';
        var sic = sicKind !== 'なし';
        var sicW = sicKind === 'ウォークスルー' ? 2 : 1;
        var famCloset = has(v.storageOpts, 'ファミリークローゼット');
        var storeroom = has(v.storageOpts, '納戸');
        var underStair = has(v.storageOpts, '階段下収納');
        var livingStorage = has(v.storageOpts, 'リビング収納');
        var study = has(v.extraRooms, '書斎');
        var guest = has(v.extraRooms, '客間');
        var hobby = has(v.extraRooms, '趣味室');
        var voidSp = has(v.extraRooms, '吹き抜け') && twoFloor;
        var elevator = has(v.extraRooms, 'ホームエレベーター');
        var doma = has(v.extraRooms, '土間収納');
        var jr = v.japaneseRoom || 'なし';
        var jrOn = jr !== 'なし';
        var jrJo = jr.indexOf('6帖') >= 0 ? 6 : 4.5;
        var bath2F = twoFloor && v.bathFloor === '2階';
        var toilets = Number(v.toilets) || 1;
        var twoGen = v.twoGen && v.twoGen !== 'なし';
        var ldkFlex = variant.ldkFlex || 3;

        var mcD =
            v.masterCloset === 'ウォークイン'
                ? 2
                : v.masterCloset === 'クローゼット'
                  ? 1
                  : 0;
        var kcD =
            v.kidsCloset === 'ウォークイン'
                ? 2
                : v.kidsCloset === 'クローゼット'
                  ? 1
                  : 0;
        var mcName = v.masterCloset === 'ウォークイン' ? 'WIC' : 'CL';
        var kcName = v.kidsCloset === 'ウォークイン' ? 'WIC' : 'CL';

        /* ---------------- 1階 玄関バンド ---------------- */
        var core1 = [
            {
                w: 2,
                min: 2,
                max: 3,
                flex: 0.3,
                tag: '玄関',
                rooms: [{ key: 'entry', name: '玄関', type: 'entry', d: 2 }],
            },
        ];
        if (sic) {
            core1.push({
                w: sicW,
                min: 1,
                max: 2,
                flex: 0.15,
                tag: 'シューズクローク',
                drop: 2,
                rooms: doma
                    ? [
                          { key: 'sic', name: 'SIC', type: 'closet', d: 1 },
                          {
                              key: 'doma',
                              name: '土間収納',
                              type: 'closet',
                              d: 1,
                          },
                      ]
                    : [{ key: 'sic', name: 'SIC', type: 'closet', d: 2 }],
            });
        }

        var svc1 = [];
        if (!bath2F) {
            svc1.push({
                w: bathW,
                min: 2,
                max: 3,
                flex: 0,
                tag: '浴室',
                rooms: [{ key: 'bath', name: '浴室', type: 'bath', d: 2 }],
            });
        }
        svc1.push({
            w: washW,
            min: 2,
            max: 3,
            flex: 0.25,
            tag: '洗面脱衣室',
            rooms: [
                {
                    key: 'wash',
                    name: bath2F ? '洗面室' : '洗面脱衣室',
                    type: 'wash',
                    d: 2,
                },
            ],
        });
        if (laundry) {
            svc1.push({
                w: 2,
                min: 2,
                max: 3,
                flex: 0.25,
                tag: 'ランドリー',
                drop: 1,
                rooms: [
                    {
                        key: 'laundry',
                        name: 'ランドリー',
                        type: 'laundry',
                        d: 2,
                    },
                ],
            });
        }
        svc1.push({
            w: 1,
            min: 1,
            max: 2,
            flex: 0,
            tag: 'トイレ',
            rooms: [{ key: 'wc1', name: 'トイレ', type: 'toilet', d: 2 }],
        });
        if (twoGen) {
            svc1.push({
                w: 3,
                min: 3,
                max: 4,
                flex: 0.4,
                tag: '親世帯寝室',
                rooms: [
                    {
                        key: 'oyabeya',
                        name: '親世帯寝室',
                        type: 'bedroom',
                        d: 2,
                    },
                ],
            });
        }

        var tail1 = [
            {
                w: 0,
                min: 0,
                max: 2,
                flex: 0.45,
                tag: '玄関収納',
                rooms: [
                    { key: 'estore', name: '収納', type: 'closet', d: 2 },
                    hallRoom('hall', 1),
                ],
            },
            {
                w: 1,
                min: 0,
                max: 3,
                flex: 1.1,
                tag: 'ホール',
                rooms: [hallRoom('hall', 3)],
            },
        ];
        if (twoFloor) {
            tail1.push({
                w: 2,
                min: 2,
                max: 2,
                flex: 0,
                stair: true,
                tag: '階段',
                rooms: underStair
                    ? [
                          { key: 'stair1', name: '階段', type: 'stair', d: 2 },
                          { key: 'ustore', name: '収納', type: 'closet', d: 1 },
                      ]
                    : [{ key: 'stair1', name: '階段', type: 'stair', d: 3 }],
            });
        } else if (elevator) {
            tail1.push({
                w: 2,
                min: 2,
                max: 2,
                flex: 0,
                tag: 'EV',
                rooms: [{ key: 'ev', name: 'EV', type: 'elevator', d: 3 }],
            });
        }

        /* ---------------- 1階 LDKバンド ----------------
       和室・パントリーの列にも LDK を「余りの深さ」として持たせ、
       LDK が L 字に回り込む、実際の住宅に近い形にする。 */
        var LDK_FILL = {
            key: 'ldk',
            name: 'LDK',
            type: 'ldk',
            merge: true,
            d: 'fill',
        };
        var bandBItems = [
            {
                w: 6,
                min: 4,
                max: 16,
                flex: ldkFlex,
                tag: 'LDK',
                rooms: [
                    {
                        key: 'ldk',
                        name: 'LDK',
                        type: 'ldk',
                        merge: true,
                        d: 'fill',
                    },
                ],
            },
        ];
        if (jrOn) {
            bandBItems.push({
                w: 3,
                min: 3,
                max: 4,
                flex: 0.35,
                tag: '和室',
                rooms: [
                    LDK_FILL,
                    { key: 'oshiire', name: '押入', type: 'closet', d: 1 },
                    {
                        key: 'washitsu',
                        name: '和室',
                        type: 'japanese',
                        d: jrJo >= 6 ? 4 : 3,
                    },
                ],
            });
        }
        var sideRooms = [];
        if (pantry)
            sideRooms.push({
                key: 'pantry',
                name: 'パントリー',
                type: 'pantry',
                d: 2,
            });
        if (livingStorage)
            sideRooms.push({
                key: 'lstore',
                name: '収納',
                type: 'closet',
                d: 1,
            });
        if (!twoFloor && study)
            sideRooms.push({ key: 'study', name: '書斎', type: 'study', d: 3 });
        if (!twoFloor && storeroom)
            sideRooms.push({
                key: 'nando',
                name: '納戸',
                type: 'storage',
                d: 2,
            });
        if (sideRooms.length) {
            sideRooms.push(LDK_FILL);
            bandBItems.push({
                w: 2,
                min: 2,
                max: 3,
                flex: 0.28,
                tag: 'パントリー等',
                drop: 3,
                rooms: sideRooms,
            });
        }

        var f1 = [
            {
                name: 'entry',
                depth: 3,
                core: core1,
                service: svc1,
                tail: tail1,
                hallKey: 'hall',
            },
            { name: 'living', depth: 5, items: bandBItems, ldk: true },
        ];

        /* ---------------- 平屋：寝室バンド ---------------- */
        if (!twoFloor) {
            var bedItems = [];
            bedItems.push({
                w: 4,
                min: 3,
                max: 6,
                flex: 1.1,
                tag: '主寝室',
                rooms: [
                    {
                        key: 'master',
                        name: '主寝室',
                        type: 'bedroom',
                        d: 'fill',
                    },
                    mcD
                        ? { key: 'wic', name: mcName, type: 'closet', d: mcD }
                        : null,
                ],
            });
            for (var ki = 0; ki < kids; ki++) {
                bedItems.push({
                    w: 3,
                    min: 2,
                    max: 5,
                    flex: 0.85,
                    tag: '子ども部屋',
                    rooms: [
                        {
                            key: 'kids' + ki,
                            name: '子ども部屋' + (kids > 1 ? ki + 1 : ''),
                            type: 'kids',
                            d: 'fill',
                        },
                        kcD
                            ? {
                                  key: 'kcl' + ki,
                                  name: kcName,
                                  type: 'closet',
                                  d: kcD,
                              }
                            : null,
                    ],
                });
            }
            if (famCloset) {
                bedItems.push({
                    w: 2,
                    min: 2,
                    max: 3,
                    flex: 0.3,
                    tag: 'ファミクロ',
                    drop: 4,
                    rooms: [
                        {
                            key: 'fcl',
                            name: 'ファミクロ',
                            type: 'closet',
                            d: 'fill',
                        },
                    ],
                });
            }
            if (toilets >= 2) {
                bedItems.push({
                    w: 1,
                    min: 1,
                    max: 1,
                    flex: 0,
                    tag: 'トイレ2',
                    drop: 5,
                    rooms: [
                        { key: 'wc2', name: 'トイレ', type: 'toilet', d: 2 },
                        {
                            key: 'store2',
                            name: '収納',
                            type: 'closet',
                            d: 'fill',
                        },
                    ],
                });
            }
            f1 = [
                f1[0],
                { name: 'bed', depth: 3 + Math.max(mcD, kcD), items: bedItems },
                f1[1],
            ];
        }

        /* ---------------- 2階 ---------------- */
        var f2 = null;
        if (twoFloor) {
            var core2 = [];
            var svc2 = [];
            if (toilets >= 2) {
                svc2.push({
                    w: 1,
                    min: 1,
                    max: 2,
                    flex: 0,
                    tag: 'トイレ2',
                    rooms: [
                        { key: 'wc2', name: 'トイレ', type: 'toilet', d: 2 },
                    ],
                });
            }
            if (bath2F) {
                svc2.push({
                    w: bathW,
                    min: 2,
                    max: 3,
                    flex: 0,
                    tag: '浴室',
                    rooms: [{ key: 'bath', name: '浴室', type: 'bath', d: 2 }],
                });
                svc2.push({
                    w: washW,
                    min: 2,
                    max: 3,
                    flex: 0,
                    tag: '洗面脱衣室',
                    rooms: [
                        { key: 'wash', name: '洗面脱衣室', type: 'wash', d: 2 },
                    ],
                });
            } else if (wash2F) {
                svc2.push({
                    w: 2,
                    min: 2,
                    max: 2,
                    flex: 0,
                    tag: '2階洗面',
                    rooms: [{ key: 'wash2', name: '洗面', type: 'wash', d: 2 }],
                });
            }
            if (famCloset) {
                svc2.push({
                    w: 2,
                    min: 2,
                    max: 3,
                    flex: 0.35,
                    tag: 'ファミクロ',
                    rooms: [
                        {
                            key: 'fcl',
                            name: 'ファミクロ',
                            type: 'closet',
                            d: 2,
                        },
                    ],
                });
            }
            if (storeroom) {
                svc2.push({
                    w: 2,
                    min: 1,
                    max: 3,
                    flex: 0.25,
                    tag: '納戸',
                    rooms: [
                        { key: 'nando', name: '納戸', type: 'storage', d: 2 },
                    ],
                });
            }
            if (study) {
                core2.push({
                    w: 2,
                    min: 2,
                    max: 3,
                    flex: 0.3,
                    tag: '書斎',
                    drop: 6,
                    rooms: [
                        { key: 'study', name: '書斎', type: 'study', d: 2 },
                    ],
                });
            }

            var tail2 = [
                {
                    w: 0,
                    min: 0,
                    max: 3,
                    flex: 0.7,
                    tag: 'ホール収納',
                    rooms: [
                        { key: 'hstore', name: '収納', type: 'closet', d: 2 },
                        hallRoom('hall2', 1),
                    ],
                },
                {
                    w: 1,
                    min: 0,
                    max: 3,
                    flex: 1.1,
                    tag: 'ホール',
                    rooms: [hallRoom('hall2', 3)],
                },
            ];
            if (elevator) {
                tail2.push({
                    w: 2,
                    min: 2,
                    max: 2,
                    flex: 0,
                    tag: 'EV',
                    rooms: [{ key: 'ev', name: 'EV', type: 'elevator', d: 3 }],
                });
            }
            tail2.push({
                w: 2,
                min: 2,
                max: 2,
                flex: 0,
                stair: true,
                tag: '階段',
                rooms: [{ key: 'stair2', name: '階段', type: 'stair', d: 3 }],
            });

            var b2 = [];
            if (voidSp) {
                b2.push({
                    w: 2,
                    min: 2,
                    max: 3,
                    flex: 0.25,
                    tag: '吹抜',
                    rooms: [
                        { key: 'void', name: '吹抜', type: 'void', d: 'fill' },
                    ],
                });
            }
            b2.push({
                w: 4,
                min: 3,
                max: 6,
                flex: 1.2,
                tag: '主寝室',
                rooms: [
                    {
                        key: 'master',
                        name: '主寝室',
                        type: 'bedroom',
                        d: 'fill',
                    },
                    mcD
                        ? { key: 'wic', name: mcName, type: 'closet', d: mcD }
                        : null,
                ],
            });
            for (var i2 = 0; i2 < kids; i2++) {
                b2.push({
                    w: 3,
                    min: 2,
                    max: 5,
                    flex: 0.9,
                    tag: '子ども部屋',
                    rooms: [
                        {
                            key: 'kids' + i2,
                            name: '子ども部屋' + (kids > 1 ? i2 + 1 : ''),
                            type: 'kids',
                            d: 'fill',
                        },
                        kcD
                            ? {
                                  key: 'kcl' + i2,
                                  name: kcName,
                                  type: 'closet',
                                  d: kcD,
                              }
                            : null,
                    ],
                });
            }
            if (guest) {
                b2.push({
                    w: 3,
                    min: 2,
                    max: 4,
                    flex: 0.45,
                    tag: '客間',
                    drop: 7,
                    rooms: [
                        {
                            key: 'guest',
                            name: '客間',
                            type: 'guest',
                            d: 'fill',
                        },
                    ],
                });
            }
            if (hobby) {
                b2.push({
                    w: 3,
                    min: 2,
                    max: 4,
                    flex: 0.45,
                    tag: '趣味室',
                    drop: 8,
                    rooms: [
                        {
                            key: 'hobby',
                            name: '趣味室',
                            type: 'hobby',
                            d: 'fill',
                        },
                    ],
                });
            }
            if (!b2.length || (b2.length === 1 && voidSp)) {
                b2.push({
                    w: 3,
                    min: 2,
                    max: 5,
                    flex: 0.6,
                    tag: '予備室',
                    rooms: [
                        {
                            key: 'freeroom',
                            name: '予備室',
                            type: 'guest',
                            d: 'fill',
                        },
                    ],
                });
            }

            f2 = [
                {
                    name: 'hall2',
                    depth: 3,
                    core: core2,
                    service: svc2,
                    tail: tail2,
                    hallKey: 'hall2',
                },
                { name: 'bed2', depth: 4 + Math.max(mcD, kcD), items: b2 },
            ];
        }

        /* ---------------- 必要マス数の見積り ---------------- */
        var need1 = jo2cells(ldkJo) + 4 + 2 + 6;
        if (!bath2F) need1 += bathW * 2 + washW * 2;
        if (laundry) need1 += 4;
        if (sic) need1 += sicW * 2;
        if (jrOn) need1 += jo2cells(jrJo) + 3;
        if (pantry) need1 += 4;
        if (livingStorage) need1 += 2;
        if (twoFloor) need1 += 6;
        if (twoGen) need1 += 6;
        if (!twoFloor) {
            need1 += jo2cells(masterJo) + kids * jo2cells(kidsJo) + 5;
            need1 += mcD * 3 + kcD * 3 * kids;
            if (famCloset) need1 += 6;
            if (study) need1 += 6;
            if (storeroom) need1 += 4;
            if (toilets >= 2) need1 += 2;
        }

        var need2 = 0;
        if (twoFloor) {
            need2 = jo2cells(masterJo) + kids * jo2cells(kidsJo) + 6 + 6;
            need2 += mcD * 3 + kcD * 3 * kids;
            if (toilets >= 2) need2 += 2;
            if (famCloset) need2 += 4;
            if (storeroom) need2 += 4;
            if (study) need2 += 4;
            if (guest) need2 += 9;
            if (hobby) need2 += 9;
            if (wash2F) need2 += 4;
            if (bath2F) need2 += bathW * 2 + washW * 2;
            if (voidSp) need2 += 8;
        }

        return {
            f1: f1,
            f2: f2,
            need1: need1,
            need2: need2,
            ldkJo: ldkJo,
            masterJo: masterJo,
            twoFloor: twoFloor,
            flags: {
                voidSp: voidSp,
                twoFloor: twoFloor,
                balcony: twoFloor && v.balcony && v.balcony !== 'なし',
                balconyType: v.balcony,
                garage: v.parking === 'ビルトイン',
                carport: v.parking === 'カーポート',
                deck: has(v.outdoorOpts, 'ウッドデッキ'),
                garden: has(v.outdoorOpts, '庭・植栽'),
                solar: has(v.equipOpts, '太陽光発電'),
                cars: Number(v.cars) || 0,
                roofType: v.roofType || '切妻',
                style: v.exteriorStyle || 'モダン',
                /* 「好きな家を選ぶ」の外観デザインで選ばれた案。3Dパースの
           外壁色・素材・縦格子・軒の出は、これに沿って描く。 */
                exterior: exteriorSpecOf(v),
            },
        };
    }

    /* 玄関バンドを組み立てる。幅が足りなければ水まわりを独立バンドに分離する。 */
    function assembleBands(bandList, maxW, variant, report) {
        var out = [];
        bandList.forEach(function (b) {
            if (!b.tail) {
                out.push(b);
                return;
            }
            var corridor = function (d) {
                return hallRoom(b.hallKey, d);
            };
            var withCorridor = function (items) {
                items.forEach(function (it) {
                    if (it.rooms[it.rooms.length - 1].type !== 'hall')
                        it.rooms.push(corridor(1));
                });
                return items;
            };
            var coreMin = b.core.reduce(function (a, it) {
                return a + itemMin(it);
            }, 0);
            var svcMin = b.service.reduce(function (a, it) {
                return a + itemMin(it);
            }, 0);
            var tailMin = b.tail.reduce(function (a, it) {
                return a + itemMin(it);
            }, 0);

            if (coreMin + svcMin + tailMin <= maxW || !b.service.length) {
                b.items = withCorridor(b.core.concat(b.service)).concat(b.tail);
                out.push(b);
            } else {
                b.items = withCorridor(b.core.slice()).concat(b.tail);
                out.push(b);
                // 水まわりを独立バンド（深さ2）へ。末尾の列が上下のホールをつなぐ。
                var svc = b.service.slice();
                svc.push({
                    w: 1,
                    min: 1,
                    max: 99,
                    flex: 2,
                    tag: '廊下',
                    rooms: [corridor(2)],
                });
                out.push({ name: b.name + '-svc', depth: 2, items: svc });
                report.split = true;
            }
            if (variant.entryFirst) {
                // 階段は必ず最後（x = W-2）に残したまま、それ以外の並びを反転する
                var last = b.items.pop();
                b.items.reverse();
                b.items.push(last);
            }
            b.core = b.service = b.tail = null;
        });
        return out;
    }

    /* ==================================================================
     4. 隣接グラフ・建具
     ================================================================== */
    var CIRC = { hall: 1, entry: 1, stair: 1, ldk: 1 };
    var NO_DOOR = { hall: 1, entry: 1, ldk: 1, stair: 1, void: 1 };
    var SLIDE = { japanese: 1, closet: 1, storage: 1, pantry: 1 };

    function edgesBetween(a, b) {
        var res = [];
        a.rects.forEach(function (r1) {
            b.rects.forEach(function (r2) {
                if (r1.x + r1.w === r2.x || r2.x + r2.w === r1.x) {
                    var y0 = Math.max(r1.y, r2.y),
                        y1 = Math.min(r1.y + r1.h, r2.y + r2.h);
                    if (y1 - y0 >= 1)
                        res.push({
                            dir: 'v',
                            pos: r1.x + r1.w === r2.x ? r2.x : r1.x,
                            a: y0,
                            b: y1,
                            len: y1 - y0,
                        });
                }
                if (r1.y + r1.h === r2.y || r2.y + r2.h === r1.y) {
                    var x0 = Math.max(r1.x, r2.x),
                        x1 = Math.min(r1.x + r1.w, r2.x + r2.w);
                    if (x1 - x0 >= 1)
                        res.push({
                            dir: 'h',
                            pos: r1.y + r1.h === r2.y ? r2.y : r1.y,
                            a: x0,
                            b: x1,
                            len: x1 - x0,
                        });
                }
            });
        });
        return res;
    }

    function contains(room, x, y) {
        for (var i = 0; i < room.rects.length; i++) {
            var r = room.rects[i];
            if (x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h)
                return true;
        }
        return false;
    }

    function buildDoors(rooms) {
        var adj = {};
        rooms.forEach(function (r) {
            adj[r.id] = [];
        });
        for (var i = 0; i < rooms.length; i++) {
            for (var j = i + 1; j < rooms.length; j++) {
                var e = edgesBetween(rooms[i], rooms[j]);
                if (!e.length) continue;
                e.sort(function (p, q) {
                    return q.len - p.len;
                });
                adj[rooms[i].id].push({ to: rooms[j], edge: e[0] });
                adj[rooms[j].id].push({ to: rooms[i], edge: e[0] });
            }
        }

        var queue = [],
            seen = {},
            parent = {};
        rooms.forEach(function (r) {
            if (CIRC[r.type]) {
                queue.push(r);
                seen[r.id] = true;
            }
        });
        if (!queue.length && rooms.length) {
            queue.push(rooms[0]);
            seen[rooms[0].id] = true;
        }

        while (queue.length) {
            var cur = queue.shift();
            adj[cur.id].sort(function (p, q) {
                return q.edge.len - p.edge.len;
            });
            adj[cur.id].forEach(function (lnk) {
                if (seen[lnk.to.id]) return;
                seen[lnk.to.id] = true;
                parent[lnk.to.id] = { from: cur, edge: lnk.edge };
                queue.push(lnk.to);
            });
        }

        var doors = [];
        rooms.forEach(function (r) {
            if (NO_DOOR[r.type]) return;
            var p = parent[r.id];
            if (!p) return;
            var e = p.edge;
            var wide =
                r.type === 'closet' ||
                r.type === 'storage' ||
                r.type === 'japanese';
            var dw = Math.min(e.len, wide ? 1.8 : 0.9);
            var mid = (e.a + e.b) / 2;
            var inside;
            if (e.dir === 'v')
                inside = contains(r, e.pos, Math.floor(mid)) ? 1 : -1;
            else inside = contains(r, Math.floor(mid), e.pos) ? 1 : -1;
            doors.push({
                dir: e.dir,
                pos: e.pos,
                a: mid - dw / 2,
                b: mid + dw / 2,
                kind: SLIDE[r.type] ? 'slide' : 'swing',
                room: r.key,
                name: r.name,
                side: inside,
            });
        });

        return {
            doors: doors,
            isolated: rooms
                .filter(function (r) {
                    return !seen[r.id] && !NO_DOOR[r.type];
                })
                .map(function (r) {
                    return r.name;
                }),
        };
    }

    /* ==================================================================
     5. 外部開口（窓）
     ================================================================== */
    var WIN_BIG = {
        ldk: 1,
        japanese: 1,
        bedroom: 1,
        kids: 1,
        guest: 1,
        study: 1,
        hobby: 1,
    };
    var WIN_SMALL = {
        bath: 1,
        wash: 1,
        toilet: 1,
        laundry: 1,
        hall: 1,
        stair: 1,
        pantry: 1,
    };

    function buildWindows(rooms, W, D) {
        var wins = [];
        rooms.forEach(function (r) {
            var big = WIN_BIG[r.type],
                small = WIN_SMALL[r.type];
            if (!big && !small) return;
            var placed = 0,
                limit = big ? 2 : 1;
            var rects = r.rects.slice().sort(function (a, b) {
                return b.w * b.h - a.w * a.h;
            });
            rects.forEach(function (rc) {
                var edges = [];
                if (rc.y === 0)
                    edges.push({ dir: 'h', pos: 0, a: rc.x, b: rc.x + rc.w });
                if (rc.y + rc.h === D)
                    edges.push({ dir: 'h', pos: D, a: rc.x, b: rc.x + rc.w });
                if (rc.x === 0)
                    edges.push({ dir: 'v', pos: 0, a: rc.y, b: rc.y + rc.h });
                if (rc.x + rc.w === W)
                    edges.push({ dir: 'v', pos: W, a: rc.y, b: rc.y + rc.h });
                edges.sort(function (p, q) {
                    var pv = p.dir === 'h' && p.pos === D ? 0 : 1;
                    var qv = q.dir === 'h' && q.pos === D ? 0 : 1;
                    return pv - qv || q.b - q.a - (p.b - p.a);
                });
                edges.forEach(function (e) {
                    if (placed >= limit) return;
                    var len = e.b - e.a;
                    if (len < 1) return;
                    var wLen = big
                        ? Math.max(1.4, Math.min(len - 0.4, len * 0.72))
                        : Math.max(0.9, Math.min(len - 0.5, len * 0.62));
                    if (wLen < 0.5) return;
                    var mid = (e.a + e.b) / 2;
                    wins.push({
                        dir: e.dir,
                        pos: e.pos,
                        a: mid - wLen / 2,
                        b: mid + wLen / 2,
                        big: !!big,
                        room: r.key,
                        kind:
                            r.type === 'ldk' && e.dir === 'h' && e.pos === D
                                ? 'sash'
                                : big
                                  ? 'window'
                                  : 'small',
                    });
                    placed++;
                });
            });
        });
        return wins;
    }

    /* ==================================================================
     6. 集計・評価
     ================================================================== */
    function measure(room) {
        room.cells = room.rects.reduce(function (s, r) {
            return s + r.w * r.h;
        }, 0);
        room.m2 = room.cells * CELL_M2;
        room.jo = room.cells / 2;
        return room;
    }

    function scorePlan(plan, v, cost) {
        var rooms = plan.floors.reduce(function (a, f) {
            return a.concat(f.rooms);
        }, []);
        var storage = 0,
            ldk = null,
            water = [],
            hall = 0;
        rooms.forEach(function (r) {
            if (
                r.type === 'closet' ||
                r.type === 'storage' ||
                r.type === 'pantry'
            )
                storage += r.m2;
            if (r.key === 'ldk') ldk = r;
            if (r.type === 'hall') hall += r.m2;
            if (r.type === 'bath' || r.type === 'wash' || r.type === 'laundry')
                water.push(r);
        });

        var kaji = 62;
        if (water.length >= 2) {
            var cx = 0,
                cy = 0;
            water.forEach(function (r) {
                cx += r.rects[0].x + r.rects[0].w / 2;
                cy += r.rects[0].y + r.rects[0].h / 2;
            });
            cx /= water.length;
            cy /= water.length;
            var spread = 0;
            water.forEach(function (r) {
                spread +=
                    Math.abs(r.rects[0].x + r.rects[0].w / 2 - cx) +
                    Math.abs(r.rects[0].y + r.rects[0].h / 2 - cy);
            });
            kaji = U.clamp(Math.round(100 - spread * 4.5), 58, 98);
        }
        if (has(v.waterOpts, 'ランドリールーム')) kaji = Math.min(98, kaji + 6);
        if (has(v.storageOpts, 'ファミリークローゼット'))
            kaji = Math.min(98, kaji + 5);
        // 廊下が少ないほど動線効率が高い
        if (plan.totalM2 > 0)
            kaji = U.clamp(
                Math.round(kaji + (0.12 - hall / plan.totalM2) * 90),
                55,
                98,
            );

        var ratio = plan.totalM2 > 0 ? storage / plan.totalM2 : 0;
        // 収納率18%で満点。上限に張り付いて案の差が消えないよう、幅を広めに取る
        var syuno = U.clamp(Math.round((ratio / 0.18) * 100), 30, 100);

        var saiko = 58;
        if (ldk) {
            var maxY = 0;
            ldk.rects.forEach(function (r) {
                maxY = Math.max(maxY, r.y + r.h);
            });
            if (maxY >= plan.gridD) saiko += 22;
            if (ldk.jo >= Number(v.ldkSize) - 0.5) saiko += 9;
            saiko += U.clamp(Math.round(ldk.jo - Number(v.ldkSize)), -6, 8);
        }
        if (has(v.extraRooms, '吹き抜け')) saiko += 6;
        if (v.roadSide === '北') saiko += 4;
        saiko = U.clamp(saiko, 50, 98);

        var budget = Number(v.budget) || 3800;
        var diff = (cost.total - budget) / budget;
        // 下限を低く取り、予算を超える案どうしでも「どちらが安いか」が点数に出るようにする
        var yosan = U.clamp(
            Math.round(100 - Math.abs(diff) * 150 - (diff > 0 ? 10 : 0)),
            8,
            98,
        );

        var pr = v.priorities || [];
        var wK = has(pr, '家事動線') ? 1.6 : 1;
        var wS = has(pr, '収納量') ? 1.6 : 1;
        var wL = has(pr, '採光・明るさ') ? 1.6 : 1;
        var wY = 1.2;
        var t =
            (kaji * wK + syuno * wS + saiko * wL + yosan * wY) /
            (wK + wS + wL + wY);

        return {
            total: Math.round(t),
            kaji: Math.round(kaji),
            syuno: Math.round(syuno),
            saiko: Math.round(saiko),
            yosan: Math.round(yosan),
        };
    }

    /* ==================================================================
     7. メイン
     ================================================================== */
    /* ------------------------------------------------------------------
     3案の性格づけ
       案A：家事動線重視 ／ 案B：開放感重視 ／ 案C：コスト重視

       bandFactor : 玄関バンドに使ってよい間口の割合。小さいほど水まわりが
                    独立バンドへ分離され、縦長でコンパクトな外形になる。
       ldkBonus   : ご希望のLDK帖数に対する増減（帖）。開放感とコストのトレードオフ。
       adjust     : その案の狙いに沿って入力条件そのものを調整する。
                    ここで諸室の要否を変えることで、名前だけでなく実際に
                    「家事動線／開放感／コスト」の性格が違うプランになる。
     ------------------------------------------------------------------ */
    function addU(arr, x) {
        var a = Array.isArray(arr) ? arr.slice() : [];
        if (a.indexOf(x) < 0) a.push(x);
        return a;
    }
    function delU(arr, x) {
        return (Array.isArray(arr) ? arr : []).filter(function (y) {
            return y !== x;
        });
    }

    var VARIANTS = [
        {
            id: 'A',
            name: '案A｜家事動線重視',
            mirror: false,
            aspect: 1.25,
            ldkFlex: 3,
            bandFactor: 1.0,
            ldkBonus: 0,
            desc:
                '水まわりを一直線に並べ、洗う→干す→しまうを最短でつなぐプラン。' +
                'ランドリールームとファミリークローゼットを確保し、洗面台も2台にします。',
            adjust: function (v) {
                v.waterOpts = addU(
                    addU(v.waterOpts, 'ランドリールーム'),
                    'パントリー',
                );
                v.storageOpts = addU(v.storageOpts, 'ファミリークローゼット');
                v.washCount = 2;
                return v;
            },
        },
        {
            id: 'B',
            name: '案B｜開放感重視',
            mirror: true,
            aspect: 1.8,
            ldkFlex: 5,
            bandFactor: 0.94,
            ldkBonus: 2,
            desc:
                'LDKをご希望より約2帖ひろげ、吹き抜けと庭側の大開口で開放感を最優先にした左右反転プラン。' +
                '面積と建築費は上がります。',
            adjust: function (v) {
                if (Number(v.floors) >= 2)
                    v.extraRooms = addU(v.extraRooms, '吹き抜け');
                v.japaneseRoom = 'なし'; // LDKをひと続きの大空間にする
                return v;
            },
        },
        {
            id: 'C',
            name: '案C｜コスト重視',
            mirror: false,
            aspect: 0.92,
            ldkFlex: 2.0,
            entryFirst: true,
            bandFactor: 0.74,
            ldkBonus: -1,
            desc:
                '外周を短い縦長の外形にまとめ、吹き抜け・小屋裏収納などコストの増える要素を省いたプラン。' +
                '延床も控えめにして建築費を抑えます。',
            adjust: function (v) {
                v.extraRooms = delU(delU(v.extraRooms, '吹き抜け'), '趣味室');
                v.storageOpts = delU(v.storageOpts, '小屋裏収納');
                if (v.balcony === 'インナー') v.balcony = '標準';
                if (v.bathSize === '1.5坪') v.bathSize = '1.25坪';
                v.targetArea = Math.max(18, (Number(v.targetArea) || 35) - 2);
                return v;
            },
        },
    ];

    function mirrorFloor(floor, W) {
        floor.rooms.forEach(function (r) {
            r.rects.forEach(function (rc) {
                rc.x = W - rc.x - rc.w;
            });
        });
    }

    function generate(v0, variantIndex) {
        var variant = VARIANTS[variantIndex || 0];
        /* 案ごとに入力条件を調整する（元の入力は書き換えない） */
        var v = {};
        Object.keys(v0).forEach(function (k) {
            v[k] = Array.isArray(v0[k]) ? v0[k].slice() : v0[k];
        });
        if (variant.adjust) v = variant.adjust(v);

        var prog = buildProgram(v, variant);
        var notes = [];

        var frontage = Number(v.frontage) || 12;
        var landDepth = Number(v.landDepth) || 14;
        // 隣地からの離れを片側0.5m確保した上で建てられる最大寸法
        var maxW = Math.max(6, Math.floor((frontage - 1.0) / 0.91));
        var maxD = Math.max(7, Math.floor((landDepth - 1.4) / 0.91));

        /* --- バンドを組み立て（幅が足りなければ水まわりを分離） --- */
        var report = { split: false };
        // 案ごとに「玄関バンドへ使ってよい間口」を変え、外形の性格を作り分ける
        var bandW = Math.max(
            6,
            Math.floor(
                maxW * (variant.bandFactor == null ? 1 : variant.bandFactor),
            ),
        );
        prog.f1 = assembleBands(prog.f1, bandW, variant, report);
        if (prog.f2) prog.f2 = assembleBands(prog.f2, bandW, variant, report);
        if (report.split) {
            notes.push({
                level: 'info',
                text: '敷地の間口に合わせ、水まわりを玄関ホールの奥にまとめた「縦長レイアウト」で計画しました。',
            });
        }

        function calcMinW() {
            var m = 6;
            [].concat(prog.f1, prog.f2 || []).forEach(function (b) {
                m = Math.max(
                    m,
                    b.items.reduce(function (a, it) {
                        return a + itemMin(it);
                    }, 0),
                );
            });
            return m;
        }
        var minW = calcMinW();
        var guard = 0;
        while (minW > maxW && guard++ < 12) {
            var target = null,
                targetBand = null;
            [].concat(prog.f1, prog.f2 || []).forEach(function (b) {
                b.items.forEach(function (it) {
                    if (!it.drop) return;
                    if (!target || it.drop < target.drop) {
                        target = it;
                        targetBand = b;
                    }
                });
            });
            if (!target) break;
            targetBand.items.splice(targetBand.items.indexOf(target), 1);
            notes.push({
                level: 'info',
                text:
                    '敷地の間口が限られるため、「' +
                    target.tag +
                    '」は今回のプランから除外しました。間口の広い敷地であれば実現できます。',
            });
            minW = calcMinW();
        }

        /* --- 外形の決定 ---
       プランごとに外形の縦横比をはっきり変えるため、
       「その案が広げてよい間口の上限（wCap）」を variant.aspect から決める。
       これを設けないと、LDKを希望帖数に合わせる反復のなかで
       どの案も間口いっぱい（maxW）に収束してしまい、3案が同じ形になる。 */
        var need = Math.max(prog.need1, prog.need2);
        var aspectW = U.clamp(
            Math.round(Math.sqrt(need * variant.aspect)),
            minW,
            Math.max(minW, maxW),
        );
        var wCap =
            variant.aspect >= 1.7
                ? Math.max(minW, maxW) // B：間口を最大限に使う
                : U.clamp(
                      aspectW + (variant.aspect >= 1.2 ? 1 : 0),
                      minW,
                      Math.max(minW, maxW),
                  );
        var W = aspectW;

        var fixed1 = prog.f1.slice(0, -1).reduce(function (a, b) {
            return a + b.depth;
        }, 0);
        var fixed2 = prog.f2
            ? prog.f2.slice(0, -1).reduce(function (a, b) {
                  return a + b.depth;
              }, 0)
            : 0;
        var D1 = U.clamp(
            Math.ceil(prog.need1 / W),
            fixed1 + 3,
            Math.max(fixed1 + 3, maxD),
        );

        function buildOne(bandList, name, totalDepth) {
            var rooms = [];
            var ctx = { floorName: name, seq: 0 };
            var fixed = bandList.slice(0, -1).reduce(function (a, b) {
                return a + b.depth;
            }, 0);
            bandList[bandList.length - 1].depth = Math.max(
                2,
                totalDepth - fixed,
            );
            var y = 0;
            bandList.forEach(function (band) {
                layoutBand(band, W, y, rooms, ctx);
                y += band.depth;
            });
            rooms.forEach(measure);
            return { name: name, rooms: rooms, gridD: totalDepth };
        }

        function roomOf(floor, key) {
            var r = null;
            floor.rooms.forEach(function (x) {
                if (x.key === key) r = x;
            });
            return r;
        }

        /* --- 1階：LDK（平屋では主寝室も）が希望の広さに収まるまで外形を調整 --- */
        var minD1 = fixed1 + 3;
        var f1 = null,
            seen1 = {},
            tries = 0;
        var ldkTarget = Math.max(12, prog.ldkJo + (variant.ldkBonus || 0)) * 2;
        while (tries++ < 24) {
            f1 = buildOne(prog.f1, '1F', D1);
            var ldk = roomOf(f1, 'ldk');
            if (!ldk) break;
            if (!prog.twoFloor) {
                var m0 = roomOf(f1, 'master');
                if (
                    m0 &&
                    m0.jo < prog.masterJo - 0.6 &&
                    prog.f1.length > 2 &&
                    prog.f1[1].depth < 8 &&
                    D1 < maxD
                ) {
                    prog.f1[1].depth++;
                    D1++;
                    continue;
                }
            }
            var tol = Math.max(2, Math.round(W * 0.3));
            var key1 = W + 'x' + D1;
            var diff = ldkTarget - ldk.cells;
            if (Math.abs(diff) <= tol || seen1[key1]) break;
            seen1[key1] = true;
            if (diff > 0) {
                if (W < wCap) W++;
                else if (D1 < maxD) D1++;
                else break;
            } else {
                if (D1 > minD1) D1--;
                else if (W > minW) W--;
                else break;
            }
        }

        /* --- 2階：1階より浅くできる（残りは下屋） --- */
        var f2 = null,
            D2 = 0;
        if (prog.f2) {
            var minD2 = fixed2 + 3;
            D2 = U.clamp(Math.ceil(prog.need2 / W), minD2, D1);
            var seen2 = {},
                t2 = 0;
            while (t2++ < 20) {
                f2 = buildOne(prog.f2, '2F', D2);
                var ms = roomOf(f2, 'master');
                if (!ms) break;
                var key2 = D1 + '/' + D2;
                var d2 = prog.masterJo * 2 - ms.cells;
                if (
                    Math.abs(d2) <= Math.max(3, Math.round(W * 0.35)) ||
                    seen2[key2]
                )
                    break;
                seen2[key2] = true;
                if (d2 > 0) {
                    if (D2 < D1) D2++;
                    else if (D1 < maxD) {
                        D1++;
                        D2++;
                        f1 = buildOne(prog.f1, '1F', D1);
                    } else break;
                } else {
                    if (D2 > minD2) D2--;
                    else break;
                }
            }
        }

        /* --- 面積の収束 ---
       LDKは残りを吸収する「fill」の室なので、放っておくと延床がご希望を大きく
       上回る。ご希望の延床（坪）を 10% 以上超えている間は、外形を1マスずつ
       縮めて作り直す（各室の最小寸法に達したら打ち切る）。 */
        var wantM2 = (Number(v.targetArea) || 40) * 3.305785;
        var areaOf = function () {
            var a = f1.rooms.reduce(function (s, r) {
                return s + r.cells;
            }, 0);
            if (f2)
                a += f2.rooms.reduce(function (s, r) {
                    return s + r.cells;
                }, 0);
            return a * CELL_M2;
        };
        var ldkFloor = prog.ldkJo; // ご希望のLDK帖数は下回らせない
        var shrink = 0;
        while (shrink++ < 8 && areaOf() > wantM2 * 1.1) {
            var keep = { W: W, D1: D1, D2: D2, f1: f1, f2: f2 };
            if (D1 > minD1 && (!prog.f2 || D1 > D2)) D1--;
            else if (W > minW) W--;
            else if (prog.f2 && D2 > fixed2 + 3) D2--;
            else break;
            f1 = buildOne(prog.f1, '1F', D1);
            if (prog.f2) {
                D2 = Math.min(D2, D1);
                f2 = buildOne(prog.f2, '2F', D2);
            }

            var ldkNow = roomOf(f1, 'ldk');
            var msNow = prog.twoFloor
                ? roomOf(f2 || f1, 'master')
                : roomOf(f1, 'master');
            // LDK・主寝室がご希望を割り込むなら、直前の外形に戻して打ち切る
            if (
                (ldkNow && ldkNow.jo < ldkFloor - 0.5) ||
                (msNow && msNow.jo < prog.masterJo - 1.0)
            ) {
                W = keep.W;
                D1 = keep.D1;
                D2 = keep.D2;
                f1 = keep.f1;
                f2 = keep.f2;
                break;
            }
        }

        var floors = f2 ? [f1, f2] : [f1];
        if (variant.mirror)
            floors.forEach(function (f) {
                mirrorFloor(f, W);
            });

        /* --- 外部要素 --- */
        var exterior = [];
        var entryRoom = roomOf(f1, 'entry');
        if (entryRoom) {
            var er = entryRoom.rects[0];
            exterior.push({
                type: 'porch',
                name: 'ポーチ',
                floor: 0,
                x: er.x - 0.2,
                y: -1.3,
                w: Math.min(er.w, 2) + 0.4,
                h: 1.3,
            });
        }
        if (prog.flags.deck) {
            exterior.push({
                type: 'deck',
                name: 'ウッドデッキ',
                floor: 0,
                x: variant.mirror ? 1 : Math.max(0, W - 5),
                y: D1,
                w: Math.min(4, W - 1),
                h: 1.8,
            });
        }
        if (prog.flags.balcony && f2) {
            var bw = prog.flags.balconyType === 'インナー' ? 5 : 4;
            exterior.push({
                type: 'balcony',
                name: 'バルコニー',
                floor: 1,
                x: Math.max(0, Math.round((W - bw) / 2)),
                y: D2,
                w: Math.min(bw, W),
                h: prog.flags.balconyType === 'インナー' ? 2 : 1.3,
            });
        }
        if (prog.flags.cars > 0) {
            var pw = (prog.flags.cars * 2.75) / 0.91;
            exterior.push({
                type: 'parking',
                name: '駐車 ' + prog.flags.cars + '台',
                floor: 0,
                x: variant.mirror ? W + 0.4 : -0.4 - pw,
                y: -1.3,
                w: pw,
                h: 5.2 / 0.91,
            });
        }

        /* --- 建具・窓・面積 --- */
        floors.forEach(function (f) {
            var d = buildDoors(f.rooms);
            f.doors = d.doors;
            f.isolated = d.isolated;
            f.windows = buildWindows(f.rooms, W, f.gridD);
            f.grossM2 = W * f.gridD * CELL_M2;
            f.voidM2 = f.rooms.reduce(function (s, x) {
                return s + (x.type === 'void' ? x.m2 : 0);
            }, 0);
            f.areaM2 = f.grossM2 - f.voidM2;
        });

        var buildArea = W * D1 * CELL_M2;
        var totalM2 = floors.reduce(function (a, f) {
            return a + f.areaM2;
        }, 0);

        var plan = {
            variant: variant,
            values: v, // この案に合わせて調整済みの入力条件
            gridW: W,
            gridD: D1,
            grid2D: D2,
            cellMm: CELL_MM,
            widthMm: W * CELL_MM,
            depthMm: D1 * CELL_MM,
            floors: floors,
            exterior: exterior,
            buildAreaM2: buildArea,
            totalM2: totalM2,
            tsubo: totalM2 / 3.305785,
            roadSide: v.roadSide || '南',
            flags: prog.flags,
            notes: notes,
        };

        /* --- 法規チェック --- */
        var landArea = Number(v.landArea) || 165;
        var cov = Number(v.coverage) || 60;
        var far = Number(v.floorRatio) || 200;
        var covActual = (buildArea / landArea) * 100;
        var farActual = (totalM2 / landArea) * 100;
        plan.legal = {
            coverage: cov,
            coverageActual: covActual,
            coverageOk: covActual <= cov + 0.5,
            floorRatio: far,
            floorRatioActual: farActual,
            floorRatioOk: farActual <= far + 0.5,
            widthOk: W * 0.91 <= frontage - 1.0 + 0.01,
            depthOk: D1 * 0.91 <= landDepth - 1.4 + 0.01,
        };
        if (!plan.legal.coverageOk) {
            plan.notes.push({
                level: 'warn',
                text:
                    '建築面積 ' +
                    covActual.toFixed(1) +
                    '% が建ぺい率の上限（' +
                    cov +
                    '%・一般的な住居系地域を想定）を超えています。1階の面積を約' +
                    Math.ceil(buildArea - (landArea * cov) / 100) +
                    '㎡減らす必要があります。実際の上限は用途地域により異なるため、建築士にご確認ください。',
            });
        }
        if (!plan.legal.floorRatioOk) {
            plan.notes.push({
                level: 'warn',
                text:
                    '延床面積 ' +
                    farActual.toFixed(1) +
                    '% が容積率の上限（' +
                    far +
                    '%・一般的な住居系地域を想定）を超えています。部屋数または広さの見直しが必要です。',
            });
        }
        if (!plan.legal.widthOk || !plan.legal.depthOk) {
            plan.notes.push({
                level: 'warn',
                text:
                    '建物の外形（' +
                    (W * 0.91).toFixed(2) +
                    'm × ' +
                    (D1 * 0.91).toFixed(2) +
                    'm）が敷地の間口・奥行に収まりません。隣地からの離れを含め、敷地条件をご確認ください。',
            });
        }
        if (f2 && D2 < D1) {
            plan.notes.push({
                level: 'info',
                text:
                    '2階を1階より' +
                    ((D1 - D2) * 0.91).toFixed(2) +
                    'm浅くし、残りを下屋（げや）としています。建築コストを抑えつつ、1階の採光を確保できます。',
            });
        }
        var iso = floors.reduce(function (a, f) {
            return a.concat(f.isolated || []);
        }, []);
        if (iso.length) {
            plan.notes.push({
                level: 'info',
                text:
                    '「' +
                    iso.join('・') +
                    '」は動線の再検討項目として記録しました。',
            });
        }
        /* 「ご希望の延床」は案ごとの調整前（＝ユーザーが入力した値）で判定する */
        var reqTsubo = Number(v0.targetArea) || Number(v.targetArea) || 34;
        if (Math.abs(plan.tsubo - reqTsubo) > 6) {
            plan.notes.push({
                level: 'info',
                text:
                    'ご希望の延床面積 ' +
                    reqTsubo +
                    ' 坪に対し、入力された諸室から算出した面積は約 ' +
                    plan.tsubo.toFixed(1) +
                    ' 坪です。LDKの帖数や部屋数・収納を調整すると近づきます。',
            });
        }
        // ご希望のLDK帖数に届かなかった場合は明示する
        var ldkRoom = roomOf(f1, 'ldk');
        if (ldkRoom && ldkRoom.jo < prog.ldkJo - 1) {
            plan.notes.push({
                level: 'warn',
                text:
                    'この案のLDKは ' +
                    Math.round(ldkRoom.jo * 10) / 10 +
                    ' 帖です（ご希望 ' +
                    prog.ldkJo +
                    ' 帖）。敷地の間口と他の諸室を優先した結果です。' +
                    '下の「AIに修正を依頼する」から「LDKをもう少し広く」を選ぶと作り直せます。',
            });
        }
        return plan;
    }

    function generateAll(v) {
        var out = [];
        for (var i = 0; i < VARIANTS.length; i++) {
            try {
                out.push(generate(v, i));
            } catch (e) {
                if (global.console) console.error('plan variant ' + i, e);
            }
        }
        return out;
    }

    global.AIH_PLANNER = {
        generate: generate,
        generateAll: generateAll,
        scorePlan: scorePlan,
        VARIANTS: VARIANTS,
        CELL_MM: CELL_MM,
        CELL_M2: CELL_M2,
    };
})(window);
