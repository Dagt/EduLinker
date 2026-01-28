import { useEffect, useState } from "react";
import { ScrollView, View, Text } from "react-native";
import i18n from "../i18n";
import { getEventAttendanceAnalytics } from "../services/analytics";

export default function EventAttendanceAnalytics() {
  const [attendance, setAttendance] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getEventAttendanceAnalytics();
        setAttendance(data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  if (!attendance) {
    return (
      <View style={{ padding: 16 }}>
        <Text>{i18n.t("general.loading")}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "600" }}>{i18n.t("analytics.attendanceTitle")}</Text>
      <Text>{i18n.t("analytics.attendingYes")}: {attendance.attending_yes}</Text>
      <Text>{i18n.t("analytics.attendingMaybe")}: {attendance.attending_maybe}</Text>
      <Text>{i18n.t("analytics.attendingNo")}: {attendance.attending_no}</Text>
      <Text>{i18n.t("analytics.participationRate")}: {(attendance.participation_rate * 100).toFixed(0)}%</Text>
      {attendance.attendance_by_group?.map((item: any) => (
        <View key={item.group_id} style={{ padding: 12, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 8 }}>
          <Text>{i18n.t("analytics.groupLabel", { id: item.group_id })}</Text>
          <Text>{i18n.t("analytics.attendingYes")}: {item.attending_yes}</Text>
          <Text>{i18n.t("analytics.attendingMaybe")}: {item.attending_maybe}</Text>
          <Text>{i18n.t("analytics.attendingNo")}: {item.attending_no}</Text>
          <Text>{i18n.t("analytics.participationRate")}: {(item.participation_rate * 100).toFixed(0)}%</Text>
        </View>
      ))}
    </ScrollView>
  );
}
