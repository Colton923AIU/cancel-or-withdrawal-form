import * as yup from "yup";

const schema = yup.object({
  AA_x002f_FAAdvisor: yup.array().required("AAFA Advisor is required"),
  CDOA: yup.string().required("CDOA is required"),
  DSM: yup.string().required("DSM is required"),
  CorW: yup
    .string()
    .oneOf(["Cancel", "Withdrawal"], "Cancel or Withdrawal")
    .required("Cancel or Withdrawal"),
  StudentID: yup.number().required("Student ID Required"),
  StudentName: yup
    .string()
    .min(2, "Full Name Required")
    .required("Student Name required"),
  StartDate: yup.date().required("Start Date Required"),
  ReasonforCancel: yup.string().when("CorW", {
    is: (val: string) => val === "Cancel",
    then: () =>
      yup
        .string()
        .oneOf(
          [
            "Academic Concerns",
            "Family Concerns",
            "Financial Concerns",
            "Default",
            "Lack of Computer/Internet Access",
            "Medical Reasons",
            "Personal Reasons",
            "Rejected POG",
            "Student did not disclose a reason",
            "Student emailed/messaged a cancel request",
            "Other",
          ],
          "Reason for Cancel Required (Cancel)"
        )
        .required("Reason for Cancel Required (Cancel)"),
    otherwise: () => yup.string().notRequired(),
  }),
  CancelReasonNote: yup.string().when("CorW", {
    is: (val: string) => val === "Cancel",
    then: () => yup.string().required("Cancel Reason Note Required (Cancel)"),
    otherwise: () => yup.string().notRequired(),
  }),
  StudentStatus: yup.string().when("CorW", {
    is: (val: string) => val === "Cancel",
    then: () =>
      yup
        .string()
        .oneOf(
          ["Active", "Original Enrollment", "Re-Enrollment"],
          "Please choose an option"
        )
        .required("Please choose an option"),
    otherwise: () => yup.string().notRequired(),
  }),
  LastContact: yup.date().when("CorW", {
    is: (val: string) => val === "Cancel",
    then: () => yup.date().required("Last Contact Required (Cancel)"),
    otherwise: () => yup.date().notRequired(),
  }),
  Notes: yup.string().when("CorW", {
    is: (val: string) => val === "Withdrawal",
    then: () =>
      yup.string().when("ESA", {
        is: (val: string) => val === "No",
        then: () => yup.string().required("Notes Required (Withdrawal)"),
        otherwise: () => yup.string().notRequired(),
      }),
    otherwise: () => yup.string().notRequired(),
  }),
  DocumentedInNotes: yup.string().when("CorW", {
    is: (val: string) => val === "Withdrawal",
    then: () =>
      yup
        .string()
        .oneOf(["Yes", "No"], "Was the request received in writing?")
        .required("Please specify Yes or No"),
    otherwise: () => yup.string().notRequired(),
  }),
  InstructorName: yup.string().when("CorW", {
    is: (val: string) => val === "Withdrawal",
    then: () => yup.string().required("Instructor Name Required (Withdrawal)"),
    otherwise: () => yup.string().notRequired(),
  }),
  WithdrawalRequestWritten: yup.string().when("ESA", {
    is: (val: string) => val === "No",
    then: () =>
      yup
        .string()
        .oneOf(["Yes", "No"], "Was the request received in writing?")
        .required("Please specify Yes or No")
        .test(
          "is-not-no",
          "Response cannot be No",
          (val: string) => val === "Yes"
        ),
    otherwise: () => yup.string().notRequired(),
  }),
  WithdrawalRequestDate: yup.date().when("ESA", {
    is: (val: string) => val === "No",
    then: () => yup.date().required(),
    otherwise: () => yup.date().notRequired(),
  }),
  ESA: yup.string().when("CorW", {
    is: (val: string) => val === "Withdrawal",
    then: () =>
      yup
        .string()
        .oneOf(["Yes", "No"], "Was the request received in writing?")
        .required("Please specify Yes or No"),
    otherwise: () => yup.string().notRequired(),
  }),
});

export default schema;
