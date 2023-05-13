import { togglePopupEdit, addEditingCatId } from "../../../features/toggle";

import { useDispatch } from "react-redux";

const EditSVG: string = require("../../../assets/chat/options/edit.svg").default;

interface idI{ _id: string };

const Edit = ({ _id }: idI): JSX.Element => {
  const editCat = () => {
    dispatch(addEditingCatId({ _id }));
    dispatch(togglePopupEdit());
  };
  const dispatch = useDispatch();

  return <img onClick={editCat} src={EditSVG} alt="edit" />;
};

export default Edit;