function* idGenerator(startingIndex: number = 0): Generator<number, number, number> {
  let i = startingIndex;
  while(true) {
    yield i++;
  }
}

export default idGenerator;