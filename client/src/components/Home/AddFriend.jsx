import {
  Button,
  ModalOverlay,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Heading,
} from "@chakra-ui/react";
import { Form, Formik } from "formik";
import TextField from "../TextField";
import { friendSchema } from "@chat-app/common";
import { useContext, useState } from "react";
import { FriendContext, SocketContext } from "./Home";

const AddFriend = ({ isOpen, onClose }) => {
  const [error, setError] = useState("");
  const { setFriendList } = useContext(FriendContext);
  const { socket } = useContext(SocketContext);
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add a friend!</ModalHeader>
        <ModalCloseButton />
        <Formik
          initialValues={{ friendName: "" }}
          onSubmit={(values) => {
            socket.emit(
              "add_friend",
              values.friendName,
              ({ errorMsg, done, newFriend}) => {
                if (done) {
                  setFriendList((c) => [newFriend, ...c]);
                  onClose();
                  return;
                } else {
                  setError(errorMsg);
                }
              }
            );
          }}
          validationSchema={friendSchema}
        >
          <Form>
            <ModalBody>
              <Heading
                as="p"
                color="red.500"
                textAlign="center"
                fontSize="md"
                pb="1rem"
              >
                {error}
              </Heading>
              <TextField
                label="Friend's name"
                placeholder="Enter friend's username"
                name="friendName"
              />
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" type="submit">
                Submit
              </Button>
            </ModalFooter>
          </Form>
        </Formik>
      </ModalContent>
    </Modal>
  );
};

export default AddFriend;
