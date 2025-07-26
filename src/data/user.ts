export type UserType = {
  userid: string;
  firstname?: string;
  lastname?: string;
  username: string;
  email: string;
  avatar?: string;
}

const user: UserType = {
  userid: "1",
  firstname: "John",
  lastname: "Doe",
  username: "shadcn",
  email: "m@example.com",
  avatar: "/avatars/shadcn.jpg"
}

export default user;