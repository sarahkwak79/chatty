import { Button } from "@chakra-ui/button";
import { ChatIcon } from "@chakra-ui/icons";
import {
  HStack,
  VStack,
  Heading,
  Divider,
  Text,
  Circle,
} from "@chakra-ui/layout";
import { Tab, TabList, useDisclosure } from "@chakra-ui/react";
import { useContext, useState } from "react";
import { FriendContext } from "./Home";
import AddFriend from "./AddFriend";

const Sidebar = () => {
  const { friendList } = useContext(FriendContext);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [key, setKey] = useState(0); // State to force re-render

  const handleClose = () => {
    console.log("Closing modal...");
    onClose();
    // Force a re-render by changing the key
    setKey(prevKey => prevKey + 1);
  };

  return (
    <div key={key}>
      <VStack py="1.4rem">
        <HStack justify="center" w="100%">
          <Heading size="md" pr="1rem" >Add Friend</Heading>
          <Button onClick={onOpen}>
            <ChatIcon />
          </Button>
        </HStack>
        <Divider />
        <VStack as={TabList}>
          {friendList.map((friend) => (
            <HStack as={Tab} key={`friend:${friend.userid}`} pb="1rem">
              <Circle
                bg={friend.connected ? "green.400" : "red.500"}
                w="15px"
                h="15px"
              />
              <Text pr="1rem" pl="1rem">{friend.username}</Text>
            </HStack>
          ))}
        </VStack>
      </VStack>
      <AddFriend isOpen={isOpen} onClose={handleClose} />
    </div>
  );
};

export default Sidebar;
