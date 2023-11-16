import { useSuspenseQuery } from "@tanstack/react-query";
import { onGetUsers } from "./index.page.telefunc";
import { suspense } from "#root/src/suspense";

export const Page = suspense(() => {
  const { data } = useSuspenseQuery({
    queryKey: ["getUsers"],
    queryFn: onGetUsers,
  });

  return (
    <div>
      {data.map((user) => (
        <div key={user}>{user}</div>
      ))}
    </div>
  );
}, "Loading....");
