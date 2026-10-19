import { type BuildingModel, type BdmIssue, type RoomType } from '@aihome/bdm';

export type PlanInput = {
    readonly frontage: number;
    readonly landDepth: number;
    readonly landAreaTsubo: number;
    readonly roadSide: '北' | '東' | '南' | '西';
    readonly landShape?: '正方形' | '長方形' | '変形' | undefined;
    readonly surroundings?: readonly string[] | undefined;
    readonly adults?: number | undefined;
    readonly children?: number | undefined;
    readonly twoGen?: string | undefined;
    readonly futureFamily?: string | undefined;
    readonly targetArea: number;
    readonly floors: 1 | 2;
    readonly ldkSize: number;
    readonly masterSize: number;
    readonly kidsRooms: number;
    readonly kidsSize: number;
    readonly roomTypes?: readonly string[] | undefined;
    readonly toilets: number;
    readonly bathSize: '1坪' | '1.25坪' | '1.5坪';
    readonly bathFloor: '1階' | '2階';
    readonly washCount: number;
    readonly waterOpts?: readonly string[] | undefined;
    readonly tatamiRoom?: string | undefined;
    readonly storageLevel?: string | undefined;
    readonly wfh?: string | undefined;
    readonly exteriorStyle?: string | undefined;
    readonly roofType?: string | undefined;
    readonly interiorStyle?: string | undefined;
    readonly priorities?: readonly string[] | undefined;
    readonly mustHave?: readonly string[] | undefined;
    readonly notNeeded?: readonly string[] | undefined;
    readonly budget?: number | undefined;
    readonly budgetScope?: string | undefined;
    readonly cars: number;
    readonly parkingType?: string | undefined;
    /** set by the planner: 'side' when the stalls sit beside the house so the front yard is only the approach */
    readonly parkingPlacement?: 'front' | 'side' | undefined;
    /** set by the planner: 'tight' uses the legal minimum setbacks when the standard ones leave no room */
    readonly setbackMode?: 'standard' | 'tight' | undefined;
    readonly evCharger?: string | undefined;
    readonly insulation?: string | undefined;
    readonly seismic?: string | undefined;
    readonly solar?: string | undefined;
    readonly coverageLimit?: number | undefined;
    readonly floorRatioLimit?: number | undefined;
    readonly masterCloset?: string | undefined;
    readonly kidsCloset?: string | undefined;
    readonly shoesCloset?: string | undefined;
    readonly storageOpts?: readonly string[] | undefined;
    readonly extraRooms?: readonly string[] | undefined;
    readonly outdoorOpts?: readonly string[] | undefined;
    readonly equipOpts?: readonly string[] | undefined;
    readonly kitchenType?: string | undefined;
};

export type PlanScore = {
    readonly housework: number;
    readonly storage: number;
    readonly daylight: number;
    readonly budget: number;
    readonly total: number;
};

export type PlanSummary = {
    readonly floorAreaM2: number;
    readonly tsubo: number;
    readonly roomsList: readonly string[];
    readonly coveragePercent: number;
    readonly floorRatioPercent: number;
    readonly unsatisfiedConstraints?: readonly string[] | undefined;
};

export type Plan = {
    readonly id: string;
    readonly label: string;
    readonly score: PlanScore;
    readonly warnings: readonly BdmIssue[];
    readonly model: BuildingModel;
    readonly summary: PlanSummary;
    readonly appliedConstraints?: readonly string[] | undefined;
    /** 'ai' when the room layout was designed by the AI (default: rule-based planner) */
    readonly source?: 'rules' | 'ai' | undefined;
};

export type PlanResult = {
    readonly plans: readonly [Plan, Plan, Plan];
    readonly warnings: readonly BdmIssue[];
    readonly appliedConstraints?: readonly string[] | undefined;
};

export type SafePlanResult =
    | { readonly ok: true; readonly data: PlanResult }
    | { readonly ok: false; readonly issues: readonly BdmIssue[] };

export type { RoomType } from '@aihome/bdm';

export type GridRect = {
    x: number;
    y: number;
    w: number;
    h: number;
};

export type GridRoom = {
    id: string;
    key: string;
    name: string;
    type: RoomType;
    isMerge?: boolean | undefined;
    rects: GridRect[];
    cells: number;
    m2: number;
    jo: number;
};
