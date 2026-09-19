export type Business = {
    _id: string;
    name: string;
    category: {
        _id: string;
        name: string;
    };
    status: string;
};

export type BusinessListResponse = {
    data: Business[];
    total: number;
}