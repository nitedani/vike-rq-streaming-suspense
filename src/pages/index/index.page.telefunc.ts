export const onGetUsers = async () => {
  console.log("onGetUsers");

  // simulate network delay
  await new Promise((r) => setTimeout(r, 500));
  return ["user1", "user2", "user3"];
};
