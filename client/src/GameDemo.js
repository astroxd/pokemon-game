import { useState, useEffect, useCallback } from "react";

const GameDemo = () => {
  const [answer, setAnswer] = useState();
  const [pokemon, setPokemon] = useState();
  const [timer, setTimer] = useState(5);
  const [points, setPoints] = useState(0);

  const [guess, setGuess] = useState("");

  const getPokemon = async () => {
    setAnswer("");
    const randomId = Math.floor(Math.random() * 1000);
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon-species/${randomId}/`
    );
    const { name, names } = await response.json();
    const answer = names.find(({ language }) => language.name === "it")?.name;
    console.log(answer);
    setAnswer(answer?.toLowerCase() ?? name.toLowerCase());
    setPokemon(name);
  };

  const checkAnswer = async (e) => {
    e.preventDefault();
    if (guess.toLowerCase() === answer) {
      setPoints((point) => point + 1);
      setGuess("");
      await getPokemon();
    }
  };

  const decreaseTimer = useCallback(() => {
    if (timer > 0) setTimer((t) => t - 1);
    else setTimer("gioco finito");
  }, [timer]);

  useEffect(() => {
    const interval = setInterval(decreaseTimer, 1000);

    return () => clearInterval(interval);
  }, [decreaseTimer]);

  useEffect(() => {
    getPokemon();
  }, []);

  return (
    <div>
      {pokemon && (
        <img
          src={`https://img.pokemondb.net/artwork/large/${pokemon}.jpg`}
          alt="cacca"
          width={200}
        />
      )}
      <form onSubmit={(e) => checkAnswer(e)}>
        <input
          type="text"
          placeholder="answer"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
        />
      </form>
      Points: {points}
      Timer: {timer}
    </div>
  );
};

export default GameDemo;
