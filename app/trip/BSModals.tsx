import BSModal from "@/components/BSModal";
import { Button, Text, View } from "@/components/Themed";
import { BottomSheetView, useBottomSheetModal } from "@gorhom/bottom-sheet";
import { useRef, useState } from "react";

const BSModals = () => {
  const [modals, setModals] = useState([]);
  const modalRefs = useRef({});

  const addModal = () => {
    const newModalId = Date.now().toString();
    setModals((prevModals) => [
      ...prevModals,
      { id: newModalId, content: `Modal ${newModalId}` },
    ]);
  };

  const openModal = (modalId) => {
    if (modalRefs.current[modalId]) {
      // dismiss all opened modals
      Object.keys(modalRefs.current).forEach((key) => {
        // if (key !== modalId) {
        modalRefs.current[key].dismiss();
        // }
      });
      modalRefs.current[modalId].present();
    }
  };

  return (
    <View
      style={{
        position: "absolute",
        top: 100,
      }}
    >
      <Button
        title="Add New Modal"
        onPress={addModal}
      />

      {modals.map((modal) => (
        <View key={modal.id}>
          <Button
            title={`Open ${modal.content}`}
            onPress={() => openModal(modal.id)}
          />
          <BSModal
            modalRef={(ref) => {
              modalRefs.current[modal.id] = ref;
            }}
          >
            <BottomSheetView>
              <Text>{modal.content}</Text>
            </BottomSheetView>
          </BSModal>
        </View>
      ))}
    </View>
  );
};

export default BSModals;
