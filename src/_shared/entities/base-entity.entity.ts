import { UniqueEntityID } from '../value-objects/unique-entity-id.vo';

export class Entity<Type> {
  private _id: UniqueEntityID;
  protected props: Type;

  constructor(props: Type, id?: string) {
    this.props = props;
    this._id = new UniqueEntityID(id);
  }
  get id() {
    return this._id;
  }

  set id(id: UniqueEntityID) {
    this._id = id;
  }
}
