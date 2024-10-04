import { Button, IconButton } from "@chakra-ui/button";
import { HStack, VStack, Box, Text, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Flex } from "@chakra-ui/react";
import { Input } from "@chakra-ui/react";
import { Field, Form, Formik } from "formik";
import { useContext, useState } from "react";
import axios from "axios";
import * as Yup from "yup";
import { MessagesContext, SocketContext } from "./Home";
import { RiRobot2Line } from "react-icons/ri";
import { IoMdClose } from "react-icons/io";

const ChatBox = ({ userid }) => {
  const { messages, setMessages } = useContext(MessagesContext);
  const { socket } = useContext(SocketContext);
  const [suggestions, setSuggestions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [userPrompt, setUserPrompt] = useState(""); 
  const [summary, setSummary] = useState("");
  
  // Function to get the last few messages for context (last 5 messages)
  const getLastFewMessages = () => {
    const lastMessages = messages
      .filter((msg) => msg.to === userid || msg.from === userid)
      .reverse()
      .slice(-5) // Get the last 5 messages
      .map((msg) => `${msg.from === userid ? 'Friend' : 'You'}: ${msg.content}`);
    return lastMessages;
  };

  const getLastFiftyMessages = () => {
    const lastMessages = messages
      .filter((msg) => msg.to === userid || msg.from === userid)
      .reverse()
      .slice(-50)
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

  // Function to fetch a summary of the last 50 messages
  const fetchSummary = async () => {
    const lastMessages = getLastFiftyMessages();

    if (lastMessages.length === 0) {
      return;
    }

    // Send the last 50 messages to the backend for summarization
    try {
      const response = await axios.post("http://localhost:4000/smart-reply/summary", {
        conversation: lastMessages,
        summarize: true,
      });

      if (response.data && response.data.summary) {
        setSummary(response.data.summary); 
      } else {
        console.log("No summary found in the API response.");
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  // Function to handle modal submit
  const handleModalSubmit = () => {
    fetchSmartReplies(); 
    setIsModalOpen(false);  
  };

  const closeSummaryBox = () => {
    setSummary(""); // Reset summary state to hide the box
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
                <Text fontSize="mb" pb="1rem" color="gray.500">Suggestions:</Text>
                <Flex wrap="wrap" spacing="2">
                  {suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="md"
                      onClick={() => setFieldValue("message", suggestion)} 
                      mb="0.5rem"
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

              {/* Get Summary Button */}
              <Button
                size="lg"
                colorScheme="teal"
                onClick={fetchSummary} // Fetch summary when button is clicked
              >
                Get Summary
              </Button>
              
              {/* Send Button */}
              <Button type="submit" size="lg" colorScheme="blue">
                Send
              </Button>
            </HStack>
            {/* Display the summary if available */}
            {summary && (
              <Box mt="1rem" p="1rem" bg="blue.100" borderRadius="md" w="100%">
                <HStack>
                  <IconButton
                    aria-label="Close summary"
                    icon={<IoMdClose style={{ fontSize: "1.2rem" }}/> } 
                    size="sm"
                    colorScheme="white"
                    onClick={closeSummaryBox} // Close the summary box
                    left="59.5rem"
                  />
                  <Text fontSize="lg" fontWeight="bold" textColor="black" mr="10rem">Conversation Summary:</Text>
                </HStack>
                <Text textColor="black" ml="2.4rem">{summary}</Text>
              </Box>
            )}
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
