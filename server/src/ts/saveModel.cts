
const saveModel = (model: any) => {
  model
  .save()
  .then((doc: any) => {
    // console.log(doc);
    // res.send({status: "successfullySaved"});
    }
  )
  .catch((err: string) => console.error(err));
}

// module.exports = { saveModel };
export default saveModel;