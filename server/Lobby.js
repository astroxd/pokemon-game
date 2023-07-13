class Lobby {
  name;
  users = [];

  isPlaying = false;
  src = "";
  answer = "";
  timer = 30;

  interval;

  constructor(code, name = "Lobby") {
    this.code = code;
    this.name = name;
  }

  // get code() {
  //   return this.code;
  // }

  get users() {
    return this.users;
  }

  addUser(user) {
    this.users.push(user);
  }

  decreaseTimer() {
    if (this.timer > 0) this.timer -= 1;
    else this.timer = "gioco finito";
  }

  // getTimer() {

  // for (var i; i < this.timer; i++) {
  //   // yield this.timer - i;
  // }
  // }
}

module.exports = { Lobby };
