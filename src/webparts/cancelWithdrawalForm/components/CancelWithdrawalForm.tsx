import * as React from "react";
import styles from "./CancelWithdrawalForm.module.scss";
import { useData } from "../hooks";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { PrimaryButton, Text } from "@fluentui/react";
import ControlledDatePicker from "../controlledFields/ControlledDatePicker/ControlledDatePicker";
import ControlledDropdown from "../controlledFields/ControlledDropdown/ControlledDropdown";
import ControlledPeoplePicker from "../controlledFields/ControlledPeoplePicker/ControlledPeoplePicker";
import ControlledTextField from "../controlledFields/ControlledTextField/ControlledTextField";
import { SPHttpClient } from "@microsoft/sp-http";
import getUserIdByemail from "../helpers/getUserByEmail/getUserByEmail";
import { ICancelWithdrawalFormWebPartProps } from "../CancelWithdrawalFormWebPart";
import Intersection from "./Intersection/Intersection";

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
    then: () => yup.string().required("Reason for Cancel Required (Cancel)"),
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
      yup.string().required("Student Status Cancel Required (Cancel)"),
    otherwise: () => yup.string().notRequired(),
  }),
  LastContact: yup.date().when("CorW", {
    is: (val: string) => val === "Cancel",
    then: () => yup.date().required("Last Contact Required (Cancel)"),
    otherwise: () => yup.date().notRequired(),
  }),
  Notes: yup.string().when("CorW", {
    is: (val: string) => val === "Withdrawal",
    then: () => yup.string().required("Notes Required (Withdrawal)"),
  }),
  DocumentedInNotes: yup.string().when("CorW", {
    is: (val: string) => val === "Withdrawal",
    then: () => yup.string().required("Required (Withdrawal)"),
    otherwise: () => yup.string().notRequired(),
  }),
  InstructorName: yup.string().when("CorW", {
    is: (val: string) => val === "Withdrawal",
    then: () => yup.string().required("Instructor Name Required (Withdrawal)"),
    otherwise: () => yup.string().notRequired(),
  }),
  ESA: yup.string().when("CorW", {
    is: (val: string) => val === "Withdrawal",
    then: () => yup.string().required("ESA Required (Withdrawal)"),
    otherwise: () => yup.string().notRequired(),
  }),
});

interface FormFields extends yup.InferType<typeof schema> {}

const Cwform: React.FC<ICancelWithdrawalFormWebPartProps> = ({
  absoluteUrl,
  cdoaToDSMListURL,
  context,
  formList,
  spHttpClient,
}) => {
  const [submitted, setSubmitted] = React.useState<boolean>(false);
  const userData = useData({
    absoluteUrl: absoluteUrl,
    spHttpClient: spHttpClient,
    spListLink: cdoaToDSMListURL,
  });
  const {
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<FormFields>({
    resolver: yupResolver(schema),
    defaultValues: {
      StartDate: new Date(),
    },
    reValidateMode: "onBlur",
    mode: "all",
  });

  const submitter = async (data: any) => {
    if (!userData || !data) return;
    const CDOA = userData.filter((item) => {
      if (item.CDOA.Id === parseInt(data.CDOA)) {
        return true;
      }
    })[0].CDOA;
    const DSM = userData.filter((item) => {
      if (item.DSM.Title === data.DSM) {
        return true;
      }
    })[0].DSM;
    const validData: any = data;
    validData.CDOANameId = CDOA.Id;
    validData.CDSMId = DSM.Id;
    validData.StudentID = data.StudentID;
    const ret = await getUserIdByemail({
      spHttpClient: spHttpClient,
      email: data.AA_x002f_FAAdvisor[0].secondaryText,
      formList: formList,
    })
      .then((data) => {
        return data.Id;
      })
      .catch((e) => {
        console.log("error: ", e);
        return null;
      });
    validData.AA_x002f_FAAdvisorId = ret;

    delete validData.CDOA;
    delete validData.DSM;
    delete validData.AA_x002f_FAAdvisor;
    spHttpClient
      .post(formList, SPHttpClient.configurations.v1, {
        body: JSON.stringify(validData),
      })
      .then((response: any) => {
        if (!response.ok) {
          return response.json().then((err: any) => {
            throw new Error(JSON.stringify(err));
          });
        }
        return response.json();
      })
      .then((data: any) => {
        setSubmitted(true);
      })
      .catch((error: any) => {
        setSubmitted(false);
        console.log("Fail:", error);
      });
  };

  if (userData === null) return <>loading...</>;

  return (
    <section className={styles.cwform}>
      <Intersection>
        <Text>
          {submitted
            ? "Submitted"
            : `${watch("CorW") ?? "Cancel/Withdrawal"} Form`}
        </Text>
      </Intersection>
      <form
        className={submitted ? styles.hidden : styles.visible}
        onSubmit={handleSubmit(submitter)}
      >
        <ControlledDropdown
          errorMessage={errors.CorW?.message}
          control={control}
          name="CorW"
          label="Request Type"
          options={[
            { key: "Cancel", text: "Cancel" },
            { key: "Withdrawal", text: "Withdrawal" },
          ]}
          onChange={(option) => {
            setValue("CorW", option);
          }}
        />
        <ControlledTextField
          errorMessage={errors.StudentName?.message}
          control={control}
          name="StudentName"
          label="Student Name"
        />
        <ControlledTextField
          errorMessage={errors.StudentID?.message}
          control={control}
          name="StudentID"
          label="Student ID"
          type="number"
        />
        <ControlledDatePicker
          control={control}
          name="StartDate"
          label="Current Start Date"
        />
        {watch("CorW") === "Withdrawal" ? (
          <>
            <ControlledTextField
              errorMessage={errors.Notes?.message}
              control={control}
              name="Notes"
              label="Student's Exact Written Request"
              type="text"
            />
            <ControlledDropdown
              errorMessage={errors.DocumentedInNotes?.message}
              control={control}
              name="DocumentedInNotes"
              label="Documented in Notes"
              options={[
                { key: "yes", text: "Yes" },
                { key: "no", text: "No" },
              ]}
            />
            <ControlledTextField
              errorMessage={errors.InstructorName?.message}
              control={control}
              name="InstructorName"
              label="Instructor Name"
              type="text"
            />
            <ControlledDropdown
              errorMessage={errors.ESA?.message}
              control={control}
              name="ESA"
              label="ESA"
              options={[
                { key: "yes", text: "Yes" },
                { key: "no", text: "No" },
              ]}
            />
          </>
        ) : (
          <>
            <ControlledDatePicker
              control={control}
              name="LastContact"
              label="Last Contact"
            />
            <ControlledTextField
              errorMessage={errors.StudentStatus?.message}
              control={control}
              name="StudentStatus"
              label="Student Status"
              type="text"
            />
            <ControlledTextField
              errorMessage={errors.ReasonforCancel?.message}
              control={control}
              name="ReasonforCancel"
              label="Reason for Cancel"
              type="text"
            />
            <ControlledTextField
              errorMessage={errors.CancelReasonNote?.message}
              control={control}
              name="CancelReasonNote"
              label="Cancel Reason Note"
              type="text"
            />
          </>
        )}
        <ControlledPeoplePicker
          errorMessage={errors.AA_x002f_FAAdvisor?.message}
          control={control}
          name="AA_x002f_FAAdvisor"
          context={context}
          titleText="Financial Aid Advisor (AA or FA to be notified)"
          personSelectionLimit={1}
          disabled={false}
          searchTextLimit={5}
        />
        <ControlledDropdown
          errorMessage={errors.CDOA?.message}
          control={control}
          name="CDOA"
          label="CDOA Name"
          options={userData.map((item) => ({
            key: item.CDOA.Id.toString(),
            text: item.CDOA.Title,
          }))}
          onChange={(val) => {
            const DSMValue = userData?.filter((item) => {
              if (item.CDOA.Id === parseInt(val)) {
                return true;
              }
            })[0].DSM.Title;
            setValue("DSM", DSMValue);
          }}
        />
        <ControlledTextField
          errorMessage={errors.DSM?.message}
          control={control}
          name="DSM"
          label="DSM"
          type="text"
          disabled={true} // Set to true or false based on your requirements
        />
        <PrimaryButton
          type="submit"
          text="Submit"
          style={{ marginTop: "5px" }}
        />
      </form>
    </section>
  );
};

export default Cwform;
