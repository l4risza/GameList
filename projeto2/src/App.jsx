import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

function App() {
  const [jogos, setJogos] = useState([]);

  useEffect(() => {
    async function carregarJogos() {
      const { data, error } = await supabase
        .from("jogos")
        .select("*");

      if (!error) {
        setJogos(data);
      }
    }

    carregarJogos();
  }, []);

  return (
    <>
      <h1>Lista de Jogos</h1>

      {jogos.map((jogo) => (
        <div key={jogo.jogo_id}>
          {jogo.titulo}
        </div>
      ))}
    </>
  );
}

export default App;