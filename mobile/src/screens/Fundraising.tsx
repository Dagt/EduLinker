import { useState } from "react";
import { View, Button } from "react-native";
import FundraisingLedger from "./FundraisingLedger";
import FundraisingExpenses from "./FundraisingExpenses";
import i18n from "../i18n";

export default function Fundraising() {
  const [view, setView] = useState<"ledger" | "expenses">("ledger");
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: "row", gap: 8, padding: 8 }}>
        <Button
          title={i18n.t("fundraising.ledger")}
          onPress={() => setView("ledger")}
        />
        <Button
          title={i18n.t("fundraising.expenses")}
          onPress={() => setView("expenses")}
        />
      </View>
      {view === "ledger" ? <FundraisingLedger /> : <FundraisingExpenses />}
    </View>
  );
}
