import { Text, VStack } from "@chakra-ui/layout";
import { TabPanel, TabPanels } from "@chakra-ui/react";
import React, { useContext, useEffect, useRef } from "react";
import { FriendContext, MessagesContext } from "./Home";
import ChatBox from "./ChatBox";

const Chat = ({ userid }) => {
  const { friendList } = useContext(FriendContext);
  const { messages } = useContext(MessagesContext);
  const bottomDiv = useRef(null);

  useEffect(() => {
    bottomDiv.current?.scrollIntoView();
  });

  return friendList.length > 0 ? (
    <VStack h="100%" justify="end">
      <TabPanels overflowY="scroll">
        {friendList.map((friend) => (
          <VStack
            flexDir="column-reverse"
            as={TabPanel}
            key={`chat:${friend.username}`}
            w="100%"
          >
            <div ref={bottomDiv} />
            {messages
              .filter(
                (msg) => msg.to === friend.userid || msg.from === friend.userid
              )
              .map((message, idx) => (
                <Text
                  m={
                    message.to === friend.userid
                      ? "0.2rem 0 0 auto !important"
                      : "0.2rem auto 0 0 !important"
                  }
                  maxW="50%"
                  key={`msg:${friend.username}.${idx}`}
                  fontSize="md"
                  bg={message.to === friend.userid ? "blue.200" : "gray.100"}
                  color="gray.800"
                  borderRadius="10px"
                  p="0.4rem 0.7rem"
                >
                  {message.content}
                </Text>
              ))}
          </VStack>
        ))}
      </TabPanels>
      <ChatBox userid={userid} />
    </VStack>
  ) : (
    <VStack
      justify="center"
      pt="5rem"
      w="100%"
      textAlign="center"
      fontSize="lg"
    >
      <TabPanels>
        <TabPanel>
          <Text>No friends. Click add friend to start chatting!</Text>
        </TabPanel>
      </TabPanels>
    </VStack>
  );
};

export default Chat;
