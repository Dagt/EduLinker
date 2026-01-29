import { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { requestPasswordReset, confirmPasswordReset } from "../api";
import i18n from "../i18n";

export default function ResetPassword(){
  const [email, setEmail] = useState("");
  const [uid, setUid] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const submitRequest = async () => {
    if (!email) {
      Alert.alert(i18n.t('general.error'), i18n.t('resetPassword.emailMissing'));
      return;
    }
    try {
      await requestPasswordReset({ email });
      Alert.alert(i18n.t('resetPassword.requestSuccess'));
      setEmail("");
    } catch (e: any) {
      Alert.alert(i18n.t('general.error'), e.message || '');
    }
  };

  const submitConfirm = async () => {
    if (!uid || !token || !password) {
      Alert.alert(i18n.t('general.error'), i18n.t('resetPassword.confirmMissing'));
      return;
    }
    if (password !== confirm) {
      Alert.alert(i18n.t('general.error'), i18n.t('resetPassword.mismatch'));
      return;
    }
    try {
      await confirmPasswordReset({ uid, token, new_password: password });
      Alert.alert(i18n.t('resetPassword.confirmSuccess'));
      setUid("");
      setToken("");
      setPassword("");
      setConfirm("");
    } catch (e: any) {
      Alert.alert(i18n.t('general.error'), e.message || '');
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 8 }}>{i18n.t('resetPassword.title')}</Text>

      <Text style={{ fontWeight: '600' }}>{i18n.t('resetPassword.requestTitle')}</Text>
      <TextInput
        placeholder={i18n.t('resetPassword.email')}
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 8, marginBottom: 8 }}
        autoCapitalize="none"
      />
      <Button title={i18n.t('resetPassword.requestButton')} onPress={submitRequest} />

      <Text style={{ fontWeight: '600', marginTop: 16 }}>{i18n.t('resetPassword.confirmTitle')}</Text>
      <TextInput
        placeholder={i18n.t('resetPassword.uid')}
        value={uid}
        onChangeText={setUid}
        style={{ borderWidth: 1, padding: 8, marginBottom: 8 }}
      />
      <TextInput
        placeholder={i18n.t('resetPassword.token')}
        value={token}
        onChangeText={setToken}
        style={{ borderWidth: 1, padding: 8, marginBottom: 8 }}
      />
      <TextInput
        placeholder={i18n.t('resetPassword.password')}
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, padding: 8, marginBottom: 8 }}
        secureTextEntry
      />
      <TextInput
        placeholder={i18n.t('resetPassword.confirm')}
        value={confirm}
        onChangeText={setConfirm}
        style={{ borderWidth: 1, padding: 8, marginBottom: 8 }}
        secureTextEntry
      />
      <Button title={i18n.t('resetPassword.confirmButton')} onPress={submitConfirm} />
    </View>
  );
}
