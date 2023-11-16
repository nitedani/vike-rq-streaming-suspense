export const onGetUsers = async () => {
  // simulate network delay
  await new Promise((r) => setTimeout(r, 500));
  return ["user1", "user2", "user3"];
};
