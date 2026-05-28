import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveUser = async (user) => {
  await AsyncStorage.setItem("user", JSON.stringify(user));
};
// get user data from AsyncStorage and parse it back to an object
export const getUser = async () => {
  const data = await AsyncStorage.getItem("user");
  return JSON.parse(data);
};

//remove user data from AsyncStorage to log out
export const logoutUser = async () => {
  await AsyncStorage.removeItem("user");
};
