import { useState } from "react";
import SuggestionsList from "./List";
import SuggestionDetail from "./Detail";

export default function Suggestions(){
  const [selected, setSelected] = useState<any|null>(null);
  const [refresh, setRefresh] = useState(0);
  if(selected){
    return <SuggestionDetail suggestion={selected} onBack={()=>{ setSelected(null); setRefresh(x=>x+1); }} />;
  }
  return <SuggestionsList refresh={refresh} onSelect={setSelected} />;
}

