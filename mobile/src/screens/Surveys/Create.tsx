import { useEffect, useState } from "react";
import { View, Text, TextInput, Button, FlatList } from "react-native";
import { createSurvey, apiGet } from "../../api";
import { getRole } from "../../role";
import i18n from "../../i18n";

export default function SurveyCreate({ onBack }: { onBack?: () => void }){
  const [role, setRole] = useState("guest");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [scope, setScope] = useState<"GROUP" | "SCHOOL">("GROUP");
  const [groupId, setGroupId] = useState<number | null>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [anonymous, setAnonymous] = useState(false);
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");

  useEffect(() => {
    (async () => {
      setRole(await getRole());
      try {
        const gs = await apiGet("/groups/");
        setGroups(gs);
      } catch {
        setGroups([]);
      }
    })();
  }, []);

  const allowed = ["DIRECTOR", "MAESTRO_TITULAR", "MAESTRO_ITINERANTE", "VOCAL"].includes(role);
  const updateOption = (text: string, idx: number) => {
    const copy = [...options];
    copy[idx] = text;
    setOptions(copy);
  };
  const addOption = () => setOptions([...options, ""]);

  const submit = async () => {
    const body: any = {
      title,
      description,
      options: options.filter((o) => o),
      scope,
      is_anonymous: anonymous,
      start_at: startAt,
      end_at: endAt,
    };
    if (scope === "GROUP") body.group = groupId;
    await createSurvey(body);
    onBack && onBack();
  };

  if (!allowed) return <Text>{i18n.t("general.unauthorized")}</Text>;

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 8 }}>{i18n.t("surveys.create")}</Text>
      <TextInput
        placeholder={i18n.t("surveys.fieldTitle")}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        placeholder={i18n.t("surveys.fieldDescription")}
        value={description}
        onChangeText={setDescription}
      />
      {options.map((opt, i) => (
        <TextInput
          key={i}
          placeholder={`${i18n.t("surveys.option")} ${i + 1}`}
          value={opt}
          onChangeText={(t) => updateOption(t, i)}
        />
      ))}
      <Button title={i18n.t("surveys.addOption")} onPress={addOption} />
      <View style={{ flexDirection: "row", marginVertical: 8, gap: 8 }}>
        <Button title={i18n.t("surveys.scopeGroup")} onPress={() => setScope("GROUP")} />
        <Button title={i18n.t("surveys.scopeSchool")} onPress={() => setScope("SCHOOL")} />
      </View>
      {scope === "GROUP" && (
        <View style={{ marginVertical: 8 }}>
          <Text>{i18n.t("surveys.selectGroup")}</Text>
          <FlatList
            data={groups}
            keyExtractor={(g) => String(g.id)}
            renderItem={({ item }) => (
              <Text onPress={() => setGroupId(item.id)}>
                - {item.name}
                {groupId === item.id ? "*" : ""}
              </Text>
            )}
          />
        </View>
      )}
      <Button
        title={`${i18n.t("surveys.anonymous")}: ${
          anonymous ? i18n.t("general.yes") : i18n.t("general.no")
        }`}
        onPress={() => setAnonymous((x) => !x)}
      />
      <TextInput
        placeholder={i18n.t("surveys.startAt")}
        value={startAt}
        onChangeText={setStartAt}
      />
      <TextInput
        placeholder={i18n.t("surveys.endAt")}
        value={endAt}
        onChangeText={setEndAt}
      />
      <Button title={i18n.t("surveys.submit")} onPress={submit} />
      {onBack ? <Button title={i18n.t("surveys.back")} onPress={onBack} /> : null}
    </View>
  );
}

