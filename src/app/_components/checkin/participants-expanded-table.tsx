import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { RegisterWithEvent } from "@/app/(pages)/manada/[orgSlug]/evento/[numberTop]/checkin/manada-day/column";
import { Row } from "@tanstack/react-table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { api } from "@/trpc/react";
import { toast } from "../ui/use-toast";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { getCurrentMembership } from "@/lib/hooks/member";
import { isCheckIn } from "@/lib/utils/hasRole";
import { useExpandedRowId } from "@/lib/store/ExpandedRowId";
import { MarkValueSearched } from "../ui/mark-value-searched";
import { ticketTypeMap } from "@/app/manadaday/participar/constant";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { type CheckedState } from "@radix-ui/react-checkbox";
import { Label } from "../ui/label";

type ParticipantsExpandedProps = {
  row: Row<RegisterWithEvent>;
  searchValue?: string;
};

type Selected = { id: string; checked: boolean };

export const ParticipantsExpandedTable = ({
  row,
  searchValue,
}: ParticipantsExpandedProps) => {
  const utils = api.useUtils();

  const { membership } = getCurrentMembership();
  const { expandedRowId } = useExpandedRowId();

  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [selected, setSelected] = React.useState<Array<Selected>>([]);

  const { mutateAsync: updateCheckIn, isPending } =
    api.manadaDay.updateCheckIn.useMutation({
      onSuccess: async () => {
        await utils.manadaDay.getAllManadaDayRegisters.invalidate();
        await utils.manadaDay.getCheckinStateByCategory.invalidate();
        setSelected([]);
        setShowConfirmDialog(false);
        toast({
          title: "Check-in efetuado com sucesso",
          variant: "success",
        });
      },
      onError: () => {
        toast({
          title: "Ops, não foi possível concluir o Check-in",
          variant: "destructive",
        });
      },
    });

  const toggleSelect = (id: string, checked: CheckedState) => {
    setSelected((prev: Selected[]) => {
      const exists = prev.find((item) => item.id === id);
      if (exists) {
        return prev.map((item) =>
          item.id === id ? { ...item, checked } : item,
        );
      } else {
        return [...prev, { id, checked }];
      }
    });
  };

  const isChecked = (id: string, checkin: boolean) => {
    const found = selected.find((item) => item.id === id);
    return found ? found.checked : checkin;
  };

  const statsLabel = (participant: { id: string; checkin: boolean }) => {
    const selectedItem = selected.find((item) => item.id === participant.id);
    if (selectedItem) {
      return "Aguardando";
    }
    return participant.checkin ? "Feito" : "Pendente";
  };

  const openDialogConfirmation = () => {
    setShowConfirmDialog(true);
  };

  const handleClick = async () => {
    const toCheckIn = selected
      .filter((item) => item.checked)
      .map((item) => item.id);

    const toUncheck = selected
      .filter((item) => !item.checked)
      .map((item) => item.id);

    try {
      await updateCheckIn({
        checkInIds: toCheckIn,
        uncheckInIds: toUncheck,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const hasPermission = isCheckIn(membership);

  return (
    <>
      <div className="space-y-4 bg-muted/20 px-4 pb-6 pt-3 sm:px-12 md:px-20">
        <div className="flex flex-col items-start  gap-3">
          <p className="text-sm font-medium text-muted-foreground">
            Participantes
          </p>
          {row.id === expandedRowId && selected.length > 0 && (
            <Button size="sm" variant="blue" onClick={openDialogConfirmation}>
              Confirmar check-in
            </Button>
          )}
        </div>
        <Table>
          <TableHeader className="border-y">
            <TableRow className="hover:bg-muted/40">
              <TableHead className="w-32 truncate">Check-in</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Ingresso</TableHead>
              <TableHead>Identificador</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {row.original.participants?.map((p) => {
              return (
                <TableRow className="hover:bg-muted/50" key={p.id}>
                  <TooltipProvider key={p.id}>
                    <Tooltip>
                      <TableCell className="truncate">
                        <TooltipTrigger className="w-full flex-1">
                          <Label
                            htmlFor={`checked-${p.id}`}
                            className="flex cursor-pointer items-center gap-2 py-3"
                          >
                            <Checkbox
                              id={`checked-${p.id}`}
                              disabled={!hasPermission}
                              checked={isChecked(p.id, p.checkin)}
                              onCheckedChange={(value) => {
                                hasPermission && toggleSelect(p.id, value);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className={`border-destructive data-[state=checked]:border-success data-[state=checked]:bg-success data-[state=checked]:text-primary-foreground`}
                            />
                            <span className="text-xs text-muted-foreground">
                              {statsLabel(p)}
                            </span>
                          </Label>
                        </TooltipTrigger>

                        <TooltipContent align="start">
                          {isChecked(p.id, p.checkin)
                            ? "Desfazer Check-in"
                            : "Fazer Check-in"}
                        </TooltipContent>
                      </TableCell>
                    </Tooltip>
                  </TooltipProvider>

                  <TableCell>
                    <MarkValueSearched
                      value={p.name}
                      searchValue={searchValue}
                    />
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`${ticketTypeMap[p.type].style} font-normal`}
                    >
                      {ticketTypeMap[p.type].label}
                    </Badge>
                  </TableCell>
                  <TableCell>{p.checkinCode}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar ação</DialogTitle>
            <DialogDescription>
              Certeza que deseja alterar o check-in?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>Cancelar</DialogClose>
            <Button variant="default" loading={isPending} onClick={handleClick}>
              Sim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
