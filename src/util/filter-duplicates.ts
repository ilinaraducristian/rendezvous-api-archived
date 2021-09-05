function duplicates(item: any, index: number, array: any[]) {
  return array.indexOf(array.find(item2 => item2.ID === item.ID)) === index;
}

export default duplicates;