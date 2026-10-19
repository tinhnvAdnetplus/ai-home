export type ComparisonLabelKey =
    | 'plan:comparisonTotalArea'
    | 'plan:comparisonFloors'
    | 'plan:comparisonLdk'
    | 'plan:comparisonBedrooms'
    | 'plan:comparisonParking'
    | 'plan:comparisonBath'
    | 'plan:comparisonStorage';

export type ComparisonRow = {
    readonly id: string;
    readonly labelKey: ComparisonLabelKey;
    readonly wishValue: string;
    readonly resultValue: string;
    readonly isMatch: boolean;
    readonly diffText?: string | undefined;
    readonly warningText?: string | undefined;
};
