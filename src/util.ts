import { Document, Model } from "mongoose";
import Server from "./entities/server";
import Group from "./entities/group";
import Member from "./entities/member";

async function insertAndSort(model: Model<Member | Group>, id: string, order: number) {
  let array, index;
  if (model.name === "Group") {
    array = await this.groupModel.find({ serverId: id }).sort({ order: 1 });
    index = array.findIndex(group => group.id.toString() === id);
  } else if (model.name === "Server") {
    array = await this.memberModel.find({ userId: id }).sort({ order: 1 });
    index = array.findIndex(server => server.serverId.toString() === id);
  }

  const element = array[index];
  array[index] = undefined;
  array.splice(order, 0, element);
  index = array.findIndex(element => element === undefined);
  array.splice(index, 1);
  const newGroups = await model.bulkSave(array.map((element, i) => {
    element.order = i;
    return element;
  }));

  return newGroups.result.upserted.map(element => ({ id: element.id.toString(), order: element.order }));
}

function sortDocuments<T extends Document & { order: number }>(documents: T[]) {
  return documents.sort((c1, c2) => c1.order - c2.order)
    .map((document, i) => ({
      ...document.toObject(),
      order: i
    }));
}

function getMaxOrder(elements: { order: number }[]) {
  try {
    return elements.reduce((c1, c2) => c1.order > c2.order ? c1 : c2).order;
  } catch (e) {
    return -1;
  }
}

export { sortDocuments, getMaxOrder };