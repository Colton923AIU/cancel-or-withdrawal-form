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
import schema from "./schema";
import formatToCustomISOString from "../helpers/formatToCustomISOString/formatToCustomISOString";

interface FormFields extends yup.InferType<typeof schema> {}

const Cwform: React.FC<ICancelWithdrawalFormWebPartProps> = ({
  absoluteUrl,
  cdoaToDSMListTitle,
  context,
  formListTitle,
  spHttpClient,
}) => {
  const [submitted, setSubmitted] = React.useState<boolean>(false);
  const [CorW, setCorW] = React.useState<boolean | null>(null);
  const [WithdrawalRequestWritten, setWithdrawalRequestWritten] =
    React.useState<boolean>(false);
  const [ESA, setESA] = React.useState<boolean>(false);
  const [LDA, setLDA] = React.useState<boolean>(false);
  const userData = useData({
    absoluteUrl: absoluteUrl,
    spHttpClient: spHttpClient,
    spListTitle: cdoaToDSMListTitle,
  });

  const {
    setValue,
    handleSubmit,
    formState: { errors },
    setError,
    control,
    setFocus,
    clearErrors,
    reset,
    resetField,
  } = useForm<FormFields>({
    resolver: yupResolver(schema),
    defaultValues: {},
    reValidateMode: "onBlur",
    mode: "all",
  });

  const submitter = async (data: any) => {
    if (!userData || !data) {
      return;
    }

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

    if (LDA) {
      validData.LDA = "Yes";
    } else {
      validData.LDA = "No";
    }

    const ret = await getUserIdByemail({
      spHttpClient: spHttpClient,
      email: data.AA_x002f_FAAdvisor[0].secondaryText,
      formListTitle: formListTitle,
      absoluteUrl: absoluteUrl,
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

    validData.StartDate = formatToCustomISOString(
      validData.StartDate ? new Date(validData.StartDate ?? "") : new Date()
    );
    validData.WithdrawalRequestDate = formatToCustomISOString(
      validData.WithdrawalRequestDate
        ? new Date(validData.WithdrawalRequestDate ?? "")
        : new Date()
    );
    validData.LastContact = formatToCustomISOString(
      validData.LastContact ? new Date(validData.LastContact ?? "") : new Date()
    );
    
    const postUrl = `${absoluteUrl}/_api/web/lists/getbytitle('${formListTitle}')/items`;

    await spHttpClient
      .post(postUrl, SPHttpClient.configurations.v1, {
        body: JSON.stringify(validData),
      })
      .then((response: any) => {
        if (!response.ok) {
          return response.json().then((err: any) => {
            throw new Error(JSON.stringify(err));
          });
        }
        setSubmitted(true);
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
        onSubmit={handleSubmit(submitter, (onInvalid) => {
          console.log("invalid:", onInvalid);
        })}
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
            reset();
            setTimeout(() => {
              setValue("CorW", option);
              if (option === "Withdrawal") {
                setCorW(true);
              } else {
                setCorW(false);
              }
            }, 100);
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
          label="Student Start Date"
        />
        {CorW ? (
          <div>
            <ControlledDropdown
              errorMessage={errors.DocumentedInNotes?.message}
              control={control}
              name="DocumentedInNotes"
              label="Documented in Notes"
              options={[
                { key: "Yes", text: "Yes" },
                { key: "No", text: "No" },
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
                  resetField("WithdrawalRequestWritten");
                  resetField("WithdrawalRequestDate");
                  resetField("Notes");
                  setESA(true);
                } else {
                  setESA(false);
                }
                setValue("ESA", val);
              }}
            />
            <ControlledDropdown
              errorMessage={errors.LDA?.message}
              control={control}
              name="LDA"
              label="LDA"
              options={[
                { key: "Yes", text: "Yes" },
                { key: "No", text: "No" },
              ]}
              onChange={(val) => {
                if (val === "Yes") {
                  setLDA(true);
                } else {
                  setLDA(false);
                }
                setValue("LDA", val);
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
                      multiline
                      maxLength={63999}
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
            <ControlledDropdown
              errorMessage={errors.StudentStatus?.message}
              control={control}
              name="StudentStatus"
              label="Student Status"
              options={[
                { key: "Active", text: "Active" },
                { key: "Original Enrollment", text: "Original Enrollment" },
                { key: "Re-Enrollment", text: "Re-Enrollment" },
              ]}
            />
            <ControlledDropdown
              errorMessage={errors.ReasonforCancel?.message}
              control={control}
              name="ReasonforCancel"
              label="Reason for Cancel"
              options={[
                { key: "Academic Concerns", text: "Academic Concerns" },
                { key: "Default", text: "Default" },
                { key: "Family Concerns", text: "Family Concerns" },
                { key: "Financial Concerns", text: "Financial Concerns" },
                {
                  key: "Lack of Computer/Internet Access",
                  text: "Lack of Computer/Internet Access",
                },
                { key: "Medical Reasons", text: "Medical Reasons" },
                { key: "Personal Reasons", text: "Personal Reasons" },
                { key: "Rejected POG", text: "Rejected POG" },
                {
                  key: "Student did not disclose a reason",
                  text: "Student did not disclose a reason",
                },
                {
                  key: "Student emailed/messaged a cancel request",
                  text: "Student emailed/messaged a cancel request",
                },
                { key: "Other", text: "Other" },
              ]}
            />
            <ControlledTextField
              errorMessage={errors.CancelReasonNote?.message}
              control={control}
              name="CancelReasonNote"
              label="Cancel Reason Notes"
              multiline
              maxLength={63999}
            />
          </div>
        )}
        <ControlledPeoplePicker
          errorMessage={errors.AA_x002f_FAAdvisor?.message}
          control={control}
          name="AA_x002f_FAAdvisor"
          context={context}
          titleText="Financial Aid Advisor or Admissions Advisor to be notified"
          personSelectionLimit={1}
          disabled={false}
          searchTextLimit={5}
        />
        <ControlledDropdown
          errorMessage={errors.CDOA?.message}
          control={control}
          name="CDOA"
          label="CDOA Name"
          options={
            userData
              ? userData
                  .slice()
                  .sort((a, b) => a.CDOA.Title.localeCompare(b.CDOA.Title))
                  .map((item) => ({
                    key: item.CDOA.Id.toString(),
                    text: item.CDOA.Title,
                  }))
              : []
          }
          calloutProps={{ calloutMaxHeight: 200 }}
          styles={{ dropdown: { width: 300 } }}
          onChange={(val) => {
            const DSMValue = userData?.filter((item) => {
              if (item.CDOA.Id === parseInt(val)) {
                return true;
              }
            })[0]?.DSM.Title;
            if (DSMValue) {
              if (errors.DSM) {
                clearErrors("DSM");
              }
              setValue("DSM", DSMValue);
            }
          }}
        />
        <ControlledTextField
          errorMessage={errors.DSM?.message}
          control={control}
          name="DSM"
          label="CDSM"
          type="text"
          disabled={true}
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
