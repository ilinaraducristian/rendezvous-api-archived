class SortedMap<V = any> extends Map<number, V> {

  private readonly sortedKeys: number[];

  constructor(entries?: readonly (readonly [number, V])[] | null) {
    super();
    this.sortedKeys = [];
    entries?.forEach(entry => {
      this.set(entry[0], entry[1]);
    });
    this._size = this.sortedKeys.length;
    // @ts-ignore
    this[Symbol.iterator] = this.iteratorFunction;
  }

  private _size: number;

  get size(): number {
    return this._size;
  }

  set(key: number, value: V): this {
    if (this.sortedKeys === undefined) return this;
    if (this.sortedKeys.findIndex(val => val === key) === -1) {
      this.sortedKeys.push(key);
      this.sortedKeys.sort();
    }
    super.set(key, value);
    this._size = this.sortedKeys.length;
    return this;
  }

  last(): V | undefined {
    if (this.size === 0) return;
    return this.get(this.sortedKeys[this.size - 1]);
  }

  delete(key: number): boolean {
    let keyIndex;
    if ((keyIndex = this.sortedKeys.findIndex(val => val === key)) === -1) {
      return false;
    }
    this.sortedKeys.splice(keyIndex, 1);
    super.delete(key);
    this._size = this.sortedKeys.length;
    return true;
  }

  forEach(callbackfn: (value: V, index: number, map: Map<number, V>, key: number) => void): void {
    this.sortedKeys.forEach((key, index) => {
      callbackfn(this.get(key) as V, index, this, key);
    });
  }

  has(key: number): boolean {
    return this.sortedKeys.includes(key);
  }

  clear(): void {
    this.sortedKeys.length = 0;
    super.clear();
  }

  filter(callbackFn: (element: V, key: number, map: SortedMap) => boolean): SortedMap<V> {
    const filteredMap = new SortedMap<V>();
    this.sortedKeys.filter((value: number) => {
      return callbackFn(this.get(value) as V, value, this);
    }).forEach(value => {
      filteredMap.set(value, this.get(value) as V);
    });
    return filteredMap;
  }

  map<K = any>(callbackFn: (value: V, key: number, map: SortedMap) => K): SortedMap<K> {
    const newSortedMap = new SortedMap<K>();
    this.sortedKeys.forEach((key) => {
      newSortedMap.set(key, callbackFn(this.get(key) as V, key, this));
    });
    return newSortedMap;
  }

  toArray(mapLike: boolean = false): [number, V][] | V[] {
    if (mapLike)
      return this.sortedKeys.map(value => [value, this.get(value) as V]);
    return this.sortedKeys.map(value => this.get(value) as V);
  }

  // toArray<T = any>(mappingfn?: (value: V, index: number, map: Map<number, V>, key: number) => T): (V | T)[] {
  //   this.sortedKeys.sort();
  //   return this.sortedKeys.map((key, index) => {
  //     const val = super.get(key);
  //     if (val === undefined) throw new Error("Value cannot be undefined");
  //     if (mappingfn !== undefined)
  //       return mappingfn(val, index, this, key);
  //     else return val;
  //   });
  // }

  private* iteratorFunction(): Generator<V> {
    for (const i of this.sortedKeys) {
      yield this.get(i) as V;
    }
  }

}

export default SortedMap;
