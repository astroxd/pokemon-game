class Lobby {
  name;
  users = [];

  isPlaying = false;
  hasGameEnded = null;

  src = "";
  answer = "";
  timer = 5;

  constructor(code, name = "Lobby") {
    this.code = code;
    this.name = name;
  }

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
}

module.exports = { Lobby };
