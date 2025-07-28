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
  username: "JohnDoe48",
  email: "john.doe@example.com",
  avatar: "/avatars/johndoe.jpg"
}

export default user;