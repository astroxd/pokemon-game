class User {
  points = 0;

  constructor(id, name) {
    this.id = id;
    this.name = name;
  }

  get points() {
    return this.points;
  }
}

module.exports = { User };
