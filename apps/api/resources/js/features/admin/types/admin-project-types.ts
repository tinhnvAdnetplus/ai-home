export type AdminProjectPlan = {
    readonly id: number;
    readonly label: string;
    readonly scoreTotal: number;
    readonly scoreHousework: number;
    readonly scoreStorage: number;
    readonly scoreDaylight: number;
    readonly scoreBudget: number;
    readonly floorAreaM2: number;
    readonly tsubo: number;
};

export type AdminProjectItem = {
    readonly id: number;
    readonly userId: number;
    readonly title: string;
    readonly status: string;
    readonly configVersion: number | null;
    readonly answers: Record<string, unknown>;
    readonly createdAt: string | null;
    readonly updatedAt: string | null;
    readonly plans: readonly AdminProjectPlan[];
    readonly user?:
        | {
              readonly id: number;
              readonly name: string;
              readonly email: string;
          }
        | null
        | undefined;
};

export type AdminProjectsResponse = {
    readonly data: readonly AdminProjectItem[];
    readonly meta: {
        readonly page: number;
        readonly perPage: number;
        readonly total: number;
        readonly lastPage: number;
    };
};
