import { describe, expect, it } from 'vitest';
import { compassToFace, faceToCompass, sunFace } from '@aihome/bdm';
import { northArrowPose } from './north-arrow';

// Plans show the road at the bottom with +x to the right.
describe('orientation by road side', () => {
    it('puts north opposite the road for a south road', () => {
        expect(northArrowPose('南').rotate).toBe('rotate(0)');
        expect(sunFace('南')).toBe('front');
        expect(compassToFace('south', 'east')).toBe('right');
    });

    it('turns north down for a north road; the sun is at the back', () => {
        expect(northArrowPose('北').rotate).toBe('rotate(180)');
        expect(sunFace('北')).toBe('back');
        expect(compassToFace('北', 'east')).toBe('left');
    });

    it('turns north right for an east road; the sun is on the left', () => {
        expect(northArrowPose('東').rotate).toBe('rotate(90)');
        expect(northArrowPose('東').labelAt(100)).toEqual({ x: 100, y: 0 });
        expect(sunFace('東')).toBe('left');
        expect(compassToFace('東', 'east')).toBe('front');
    });

    it('turns north left for a west road; the sun is on the right', () => {
        expect(northArrowPose('西').rotate).toBe('rotate(270)');
        expect(sunFace('west')).toBe('right');
        expect(compassToFace('西', 'west')).toBe('front');
    });

    it('maps faces back to the same compass sides', () => {
        for (const road of ['北', '東', '南', '西'] as const) {
            for (const c of ['north', 'east', 'south', 'west'] as const) {
                expect(faceToCompass(road, compassToFace(road, c))).toBe(c);
            }
        }
    });
});
