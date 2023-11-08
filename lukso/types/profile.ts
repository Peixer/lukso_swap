import type { ImageJson, LinkJson } from './asset';

export class Profile {
  address: string;

  backgroundImage: ImageJson[];

  description: string;

  links: LinkJson[];

  name: string;

  profileImage: ImageJson[];

  tags: string[];

  constructor(address: string, rawProfile: any) {
    const lsp3Profile: any = rawProfile.LSP3Profile;

    this.address = address;
    this.backgroundImage = (lsp3Profile?.backgroundImage as ImageJson[]) ?? [];
    this.description = (lsp3Profile?.description as string) ?? '';
    this.links = (lsp3Profile?.links as LinkJson[]) ?? [];
    this.name = (lsp3Profile?.name as string) ?? '';
    this.profileImage = (lsp3Profile?.profileImage as ImageJson[]) ?? [];
    this.tags = (lsp3Profile?.tags as string[]) ?? [];
  }
}