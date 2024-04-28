import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { createUser } from "../../lib/appwrite";
import { images } from "../../constants";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import { Link, router } from "expo-router";
import { useGlobalContext } from "../../context/GlobalProvider";

const SignUpScreen = () => {
  const [form, setForm] = useState({
    userName: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const { setUser, setIsLoggedIn } = useGlobalContext();

  const handleSubmit = async () => {
    if (!form.userName || !form.password || !form.email) {
      Alert.alert("Error", "Please fill in all the fields");
    }
    setLoading(true);
    try {
      const result = await createUser(
        form?.email,
        form?.password,
        form?.userName
      );

      setUser(result);
      setIsLoggedIn(true);

      router.replace("/home");
    } catch (error) {
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
    // createUser();
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="w-full justify-center min-h-[85vh] px-4 my-12">
          <Image
            source={images.logo}
            resizeMode="contain"
            className="w-[115px] h-[35px]"
          />
          <Text className="text-white text-semibold mt-10 font-psemibold">
            Sign Up into Aora
          </Text>
          <FormField
            title="Username"
            value={form.userName}
            handleChangeText={(e) => setForm({ ...form, userName: e })}
            otherStyles="mt-7"
          />
          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e })}
            otherStyles="mt-7"
            keyboardType="email-address"
          />
          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles="mt-7"
            keyboardType="email-address"
          />
          <CustomButton
            title="Sign Up"
            handlePress={handleSubmit}
            containerStyles="mt-7"
            isLoading={loading}
          />
          <View className="justify-center pt-5 flez-row gap-2">
            <Text className="text-lg text-gray-100 font-pregular">
              Already have an Account ?
            </Text>
            <Link
              href={"/sign-in"}
              className="text-lg text-secondary font-psemibold"
            >
              Sign In Instead
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUpScreen;
