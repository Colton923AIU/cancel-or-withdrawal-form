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
    then: () =>
      yup.string().when("WithdrawalRequestWritten", {
        is: (val: string) => val === "Yes",
        then: () => yup.string().required("Notes Required (Withdrawal)"),
        otherwise: () =>
          yup
            .string()
            .test(
              "invalid-withdrawal",
              "The withdrawal must be in writing. You cannot complete this form.",
              function (value) {
                return false;
              }
            ),
      }),
    otherwise: () => yup.string().notRequired(),
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
    then: () => yup.string().required(),
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
  const [CorW, setCorW] = React.useState<boolean | null>(null);
  const [WithdrawalRequestWritten, setWithdrawalRequestWritten] =
    React.useState<boolean>(false);
  const [ESA, setESA] = React.useState<boolean>(false);
  const userData = useData({
    absoluteUrl: absoluteUrl,
    spHttpClient: spHttpClient,
    spListLink: cdoaToDSMListURL,
  });
  const {
    setValue,
    handleSubmit,
    formState: { errors },
    setError,
    control,
    setFocus,
    clearErrors,
  } = useForm<FormFields>({
    resolver: yupResolver(schema),
    defaultValues: {
      StartDate: new Date(),
      WithdrawalRequestDate: new Date(),
    },
    reValidateMode: "onBlur",
    mode: "all",
  });
  function formatToCustomISOString(date: Date): string {
    const isoString = date.toISOString(); // Generates: "2025-01-31T06:00:00.000Z"
    const [datePart, timePart] = isoString.split("T");
    const [time] = timePart.split(".");
    const fractionalSeconds = (date.getMilliseconds() * 1000).toString();

    // Manually ensure 7 digits for fractional seconds
    const fullFractionalSeconds =
      fractionalSeconds + "0000000".slice(fractionalSeconds.length);

    return `${datePart}T${time}.${fullFractionalSeconds}Z`;
  }

  const submitter = async (data: any) => {
    console.log("userData: ", userData);
    console.log("data: ", data);
    console.log("submitting");
    if (!userData || !data) return;
    console.log("still submitting");
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
        if (errors) {
          const firstErrorField = Object.keys(errors)[0];
          if (firstErrorField) {
            setFocus(firstErrorField as any);
          }
          return;
        }
        return null;
      });
    validData.AA_x002f_FAAdvisorId = ret;

    delete validData.CDOA;
    delete validData.DSM;
    delete validData.AA_x002f_FAAdvisor;
    delete validData.WithdrawalRequestWritten;
    // 2024-04-15T10:30:09.7552052Z
    validData.LastContact = formatToCustomISOString(
      new Date(validData.LastContact)
    );
    validData.StartDate = formatToCustomISOString(
      new Date(validData.StartDate)
    );
    validData.WithdrawalRequestDate = formatToCustomISOString(
      new Date(validData.WithdrawalRequestDate)
    );
    await spHttpClient
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

  if (userData === null) {
    return (
      <div className={styles.load}>
        <div className={styles.loader} />
      </div>
    );
  }

  return (
    <section className={styles.cwform}>
      <Intersection>
        <div
          style={{
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text variant="mediumPlus" style={{ textAlign: "center" }}>
            {submitted
              ? "Submitted"
              : CorW === null
              ? "Cancel / Withdrawal Form"
              : CorW
              ? "Withdrawal Form"
              : "Cancel Form"}
          </Text>
        </div>
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
            if (option === "Withdrawal") {
              setCorW(true);
            } else {
              setCorW(false);
            }
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
        {CorW ? (
          <div>
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
                { key: "Yes", text: "Yes" },
                { key: "No", text: "No" },
              ]}
              onChange={(val) => {
                if (val === "Yes") {
                  setESA(true);
                } else {
                  setESA(false);
                }
                setValue("ESA", val);
              }}
            />
            {!ESA && (
              <div>
                <ControlledDropdown
                  errorMessage={errors.WithdrawalRequestWritten?.message}
                  control={control}
                  name="WithdrawalRequestWritten"
                  label="Was the request received in writing?"
                  options={[
                    { key: "Yes", text: "Yes" },
                    { key: "No", text: "No" },
                  ]}
                  onChange={(option) => {
                    if (option === "No") {
                      setError("WithdrawalRequestWritten", {
                        message:
                          "This form cannot be submitted if the request was not in writing.",
                      });
                    }
                    setValue("WithdrawalRequestWritten", option);
                    if (option === "Yes") {
                      setWithdrawalRequestWritten(true);
                    } else {
                      setWithdrawalRequestWritten(false);
                    }
                  }}
                />
                {WithdrawalRequestWritten && (
                  <div>
                    <ControlledDatePicker
                      control={control}
                      name="WithdrawalRequestDate"
                      label="Date the written request was received:"
                    />

                    <ControlledTextField
                      errorMessage={errors.Notes?.message}
                      control={control}
                      name="Notes"
                      label="Student's Exact Written Request"
                      type="text"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
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
          </div>
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
            if (errors.DSM) {
              clearErrors("DSM");
            }
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
        <Intersection>
          <PrimaryButton
            type="submit"
            text="Submit"
            style={{ marginTop: "5px" }}
          />
        </Intersection>
      </form>
    </section>
  );
};

export default Cwform;
