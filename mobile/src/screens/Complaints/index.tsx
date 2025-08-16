import { useState } from "react";
import ComplaintsList from "./List";
import ComplaintDetail from "./Detail";

export default function Complaints(){
  const [selected, setSelected] = useState<any|null>(null);
  const [refresh, setRefresh] = useState(0);

  if(selected){
    return <ComplaintDetail complaint={selected} onBack={()=>{ setSelected(null); setRefresh(x=>x+1); }} />;
  }
  return <ComplaintsList refresh={refresh} onSelect={setSelected} />;
}

