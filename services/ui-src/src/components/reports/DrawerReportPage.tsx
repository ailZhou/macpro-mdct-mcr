import { useContext, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
// components
import {
  Box,
  Button,
  Flex,
  Image,
  Heading,
  Link,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import {
  ReportDrawer,
  ReportContext,
  ReportPageFooter,
  ReportPageIntro,
} from "components";
// utils
import { filterFormData, useUser } from "utils";
import {
  AnyObject,
  EntityShape,
  DrawerReportPageShape,
  ReportStatus,
} from "types";
import completedIcon from "assets/icons/icon_check_circle.png";

export const DrawerReportPage = ({ route }: Props) => {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { report, updateReport } = useContext(ReportContext);
  const { full_name, state, userIsStateUser, userIsStateRep } =
    useUser().user ?? {};
  // make state
  const [selectedEntity, setSelectedEntity] = useState<EntityShape | undefined>(
    undefined
  );

  const { entityType, verbiage, drawerForm } = route;
  const entities = report?.fieldData?.[entityType];

  const missingEntitiesVerbiage: any = {
    plans: {
      message:
        "This program is missing plans. You won’t be able to complete this section until you’ve added all the plans that participate in this program in section A.7.",
      link: {
        text: "Add Plans.",
        href: "/mcpar/program-information/add-plans",
      },
    },
    bssEntities: {
      message:
        "This program is missing BSS entities. You won’t be able to complete this section until you’ve added all the names of BSS entities that support enrollees in the program.",
      link: {
        text: "Add BSS entities.",
        href: "/mcpar/program-information/add-bss-entities",
      },
    },
  };
  const { message: missingEntitiesMessage, link: missingEntitiesLink } =
    missingEntitiesVerbiage[entityType];

  const openRowDrawer = (entity: EntityShape) => {
    setSelectedEntity(entity);
    onOpen();
  };

  const onSubmit = async (enteredData: AnyObject) => {
    if (userIsStateUser || userIsStateRep) {
      setSubmitting(true);
      const reportKeys = {
        state: state,
        id: report?.id,
      };
      const currentEntities = [...(report?.fieldData[entityType] || {})];
      const selectedEntityIndex = report?.fieldData[entityType].findIndex(
        (entity: EntityShape) => entity.name === selectedEntity?.name
      );
      const filteredFormData = filterFormData(enteredData, drawerForm.fields);
      const newEntity = {
        ...selectedEntity,
        ...filteredFormData,
      };
      let newEntities = currentEntities;
      newEntities[selectedEntityIndex] = newEntity;
      const dataToWrite = {
        status: ReportStatus.IN_PROGRESS,
        lastAlteredBy: full_name,
        fieldData: {
          [entityType]: newEntities,
        },
      };
      await updateReport(reportKeys, dataToWrite);
      setSubmitting(false);
    }
    onClose();
  };

  /*
   * If the entity has any data from any drawerForms fields,
   * it must have been completed at some point. So simply check to
   * see if the first drawerForm field has been entered and saved
   * to the entity
   */
  const checkIfEntityIsCompleted = (entity: EntityShape) =>
    drawerForm.fields?.[0]?.id in entity;

  const entityRows = (entities: EntityShape[]) => {
    return entities.map((entity) => {
      const isEntityCompleted = checkIfEntityIsCompleted(entity);
      return (
        <Flex key={entity.id} sx={sx.entityRow}>
          {isEntityCompleted && (
            <Image
              src={completedIcon}
              alt={"Entity is complete"}
              sx={sx.statusIcon}
            />
          )}
          <Heading as="h4" sx={sx.entityName}>
            {entity.name}
          </Heading>
          <Button
            sx={sx.enterButton}
            onClick={() => openRowDrawer(entity)}
            variant="outline"
          >
            {isEntityCompleted ? "Edit" : "Enter"}
          </Button>
        </Flex>
      );
    });
  };
  return (
    <Box data-testid="drawer-report-page">
      {verbiage.intro && <ReportPageIntro text={verbiage.intro} />}
      <Heading as="h3" sx={sx.dashboardTitle}>
        {verbiage.dashboardTitle}
      </Heading>
      {entities?.length ? (
        entityRows(entities)
      ) : (
        <Text sx={sx.emptyEntityMessage}>
          {missingEntitiesMessage}{" "}
          <Link as={RouterLink} to={missingEntitiesLink.href}>
            {missingEntitiesLink.text}
          </Link>
        </Text>
      )}
      <ReportDrawer
        selectedEntity={selectedEntity!}
        verbiage={{
          drawerTitle: `${verbiage.drawerTitle} ${selectedEntity?.name}`,
          drawerInfo: verbiage.drawerInfo,
        }}
        form={drawerForm}
        onSubmit={onSubmit}
        submitting={submitting}
        drawerDisclosure={{
          isOpen,
          onClose,
        }}
        data-testid="report-drawer"
      />
      <ReportPageFooter />
    </Box>
  );
};

interface Props {
  route: DrawerReportPageShape;
}

const sx = {
  statusIcon: {
    height: "1.25rem",
    position: "absolute",
  },
  dashboardTitle: {
    paddingBottom: "0.75rem",
    borderBottom: "1.5px solid var(--chakra-colors-palette-gray_lighter)",
    color: "palette.gray_medium",
    fontSize: "lg",
    fontWeight: "bold",
  },
  entityRow: {
    justifyContent: "space-between",
    alignItems: "center",
    height: "3.25rem",
    padding: "0.5rem",
    paddingLeft: "0.75rem",
    borderBottom: "1.5px solid var(--chakra-colors-palette-gray_lighter)",
  },
  entityName: {
    fontSize: "lg",
    fontWeight: "bold",
    flexGrow: 1,
    marginLeft: "2.25rem",
  },
  emptyEntityMessage: {
    paddingTop: "1rem",
    fontWeight: "bold",
  },
  enterButton: {
    width: "4.25rem",
    height: "1.75rem",
    fontSize: "md",
    fontWeight: "normal",
  },
};
