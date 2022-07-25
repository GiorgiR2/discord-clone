
const saveModel = (model) => {
  model
  .save()
  .then(doc => {
    // console.log(doc);
    // res.send({status: "successfullySaved"});
    }
  )
  .catch(err => console.error(err));
}

module.exports = { saveModel };