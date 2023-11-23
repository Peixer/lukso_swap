import { Asset } from "./asset";

export enum DEAL_STATE {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
}

export const getEnumState = (status: number): DEAL_STATE => {
  switch (status) {
    case 0:
      return DEAL_STATE.PENDING;
    case 1:
      return DEAL_STATE.ACCEPTED;
    case 2:
      return DEAL_STATE.REJECTED;
    default:
      throw new Error("Invalid state");
  }
}

export class Deal {
  users: DealUser[];
  state: DEAL_STATE;
  creationDate?: Date;
  closedDate?: Date;
  id?: string;

  constructor(
    id: string,
    users: DealUser[],
    state: DEAL_STATE,
    creationDate?: Date,
    closedDate?: Date
  ) {
    this.id = id;
    this.users = users;
    this.state = state;
    this.creationDate = creationDate;
    this.closedDate = closedDate;
  }
}

export class DealUser {
  address: string;
  assets: Asset[];
  name?: string;

  constructor(address: string, assets: Asset[], name?: string) {
    this.address = address;
    this.assets = assets;
    this.name = name;
  }
}
