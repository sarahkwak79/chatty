import UserContext from "./components/AccountContext";
import ToggleDarkMode from "./components/ToggleDarkMode";
import Views from "./components/Views";

function App() {
  return (
    <>
      <UserContext>
        <Views />
        <ToggleDarkMode />
      </UserContext>
    </>
  );
}

export default App;
