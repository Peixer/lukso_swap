import { Asset } from "./asset";

export class DealUser {
    address: string;
    assets: Asset[];
    name?: string;

    constructor(address: string, assets: Asset[], name? : string) {
        this.address = address;
        this.assets = assets;
        this.name = name;
    }
};