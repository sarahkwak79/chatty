import { Button, IconButton } from "@chakra-ui/button";
import { HStack, VStack, Box, Text, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Flex } from "@chakra-ui/react";
import { Input } from "@chakra-ui/react";
import { Field, Form, Formik } from "formik";
import { useContext, useState } from "react";
import axios from "axios";
import * as Yup from "yup";
import { MessagesContext, SocketContext } from "./Home";
import { RiRobot2Line } from "react-icons/ri";

const ChatBox = ({ userid }) => {
  const { messages, setMessages } = useContext(MessagesContext);
  const { socket } = useContext(SocketContext);
  const [suggestions, setSuggestions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [userPrompt, setUserPrompt] = useState(""); 
  
  // Function to get the last few messages for context (last 5 messages)
  const getLastFewMessages = () => {
    const lastMessages = messages
      .filter((msg) => msg.to === userid || msg.from === userid)
      .reverse()
      .slice(-5) // Get the last 5 messages
      .map((msg) => `${msg.from === userid ? 'Friend' : 'You'}: ${msg.content}`);
    return lastMessages;
  };

  // Fetch smart reply suggestions from the backend
  const fetchSmartReplies = async () => {
    const lastMessages = getLastFewMessages();  

    if (lastMessages.length === 0) {
      return;
    }
  
    // Make API call with userPrompt
    try {
      const response = await axios.post("http://localhost:4000/smart-reply/generate", {
        conversation: lastMessages,
        userPrompt: userPrompt, 
      });

      if (response.data && response.data.suggestions) {
        setSuggestions(response.data.suggestions);
      } else {
        console.log("No suggestions found in the API response.");
      }
    } catch (error) {
      console.error("Error fetching smart replies:", error);
    }
  };

  // Function to handle modal submit
  const handleModalSubmit = () => {
    fetchSmartReplies(); 
    setIsModalOpen(false);  
  };
  
  return (
    <>
      <Formik
        initialValues={{ message: "" }}
        validationSchema={Yup.object({
          message: Yup.string().min(1).max(255),
        })}
        onSubmit={(values, actions) => {
          const message = { to: userid, from: null, content: values.message };
          socket.emit("dm", message); 
          setMessages((prevMsgs) => [message, ...prevMsgs]); 
          actions.resetForm(); 
          setSuggestions([]); 
        }}
      >
        {({ values, setFieldValue }) => (
          <VStack w="100%" pb="1.4rem" px="1.4rem">
            {/* Smart Reply Suggestions */}
            {suggestions.length > 0 && (
              <Box w="100%" mb="0.5rem">
                <Text fontSize="md" pb="1rem" color="gray.500">Suggestions:</Text>
                <Flex wrap="wrap" spacing="2">
                  {suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="md"
                      onClick={() => setFieldValue("message", suggestion)} 
                    >
                      {suggestion}
                    </Button>
                  ))}
                </Flex>
              </Box>
            )}

            <HStack as={Form} w="100%">
              {/* Input field for message */}
              <Input
                as={Field}
                name="message"
                placeholder="Type message here..."
                size="lg"
                autoComplete="off"
              />
              
              <IconButton
                aria-label="Get smart reply suggestions"
                icon={<RiRobot2Line style={{ fontSize: "2rem" }}/>} 
                onClick={() => setIsModalOpen(true)}  
                size="lg"
                colorScheme="teal"
                variant="ghost"
              />
              
              {/* Send Button */}
              <Button type="submit" size="lg" colorScheme="blue">
                Send
              </Button>
            </HStack>
          </VStack>
        )}
      </Formik>

      {/* Modal to input the type of response */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Enter the type of response</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="e.g., funny, say no politely, lovingly"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)} 
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleModalSubmit}>
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ChatBox;
