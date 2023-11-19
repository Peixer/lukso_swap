import { Asset } from "./asset";

export enum DEAL_STATE{
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED'
}

export class Deal{

    users: DealUser[];
    state: DEAL_STATE;
    creationDate? : Date;
    closedDate? : Date;

    constructor(users: DealUser[], state : DEAL_STATE, creationDate? : Date, closedDate? : Date) {
        this.users = users;
        this.state = state;
        this.creationDate = creationDate;
        this.closedDate = closedDate;
    }
};

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