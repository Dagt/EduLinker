/* istanbul ignore file */
import { useEffect, useState } from "react";
import { View, Text, FlatList, Button, TouchableOpacity } from "react-native";
import { apiGet, assignVocal, deactivateVocal } from "../../api";
import i18n from "../../i18n";

interface Parent {
  id: number;
  first_name: string;
  last_name: string;
}

interface Assignment {
  id: number;
  parent: number;
  active: boolean;
}

export default function VocalAssignments({ groupId }: { groupId: number }) {
  const [parents, setParents] = useState<Parent[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedParent, setSelectedParent] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const m = await apiGet(`/groups/${groupId}/members/`);
      setParents(m.parents || []);
      const a = await apiGet(`/groups/vocal-assignments/?group=${groupId}`);
      setAssignments((a || []).filter((x: any) => x.active));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [groupId]);

  const assign = async () => {
    if (!selectedParent) return;
    await assignVocal({ group: groupId, parent: selectedParent });
    setSelectedParent(null);
    await load();
  };

  const deactivate = async (id: number) => {
    await deactivateVocal(id);
    await load();
  };

  const availableParents = parents.filter(
    (p) => !assignments.find((a) => a.parent === p.id)
  );

  if (loading) return <Text>{i18n.t("general.loading")}</Text>;
  if (error) return <Text>{i18n.t("general.error")}</Text>;

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 8 }}>
        {i18n.t("vocalAssignments.title")}
      </Text>
      <FlatList
        data={assignments}
        keyExtractor={(x) => String(x.id)}
        ListEmptyComponent={<Text>{i18n.t("vocalAssignments.none")}</Text>}
        renderItem={({ item }) => {
          const p = parents.find((x) => x.id === item.parent);
          return (
            <View
              style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}
            >
              <Text style={{ flex: 1 }}>{
                p ? `${p.first_name} ${p.last_name}` : item.parent
              }</Text>
              <Button
                title={i18n.t("vocalAssignments.revoke")}
                onPress={() => deactivate(item.id)}
                testID={`revoke-${item.id}`}
              />
            </View>
          );
        }}
      />
      <Text style={{ marginTop: 16 }}>{i18n.t("vocalAssignments.selectParent")}</Text>
      <FlatList
        horizontal
        data={availableParents}
        keyExtractor={(x) => String(x.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedParent(item.id)}
            style={{
              padding: 8,
              marginRight: 8,
              backgroundColor: selectedParent === item.id ? "#ddd" : "#eee",
              borderRadius: 4,
            }}
            testID={`parent-${item.id}`}
          >
            <Text>{`${item.first_name} ${item.last_name}`}</Text>
          </TouchableOpacity>
        )}
      />
      <Button
        title={i18n.t("vocalAssignments.assign")}
        onPress={assign}
        disabled={!selectedParent}
        testID="assign-btn"
      />
    </View>
  );
}
