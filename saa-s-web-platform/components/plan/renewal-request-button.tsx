"use client"

import { useState } from "react"
import { CheckCircle, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function RenewalRequestButton({
  variant = "default",
  size = "sm",
  className,
  onSubmitted,
  disabled,
}: {
  variant?: React.ComponentProps<typeof Button>["variant"]
  size?: React.ComponentProps<typeof Button>["size"]
  className?: string
  disabled?: boolean
  onSubmitted?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [sent, setSent] = useState(false)

  const submit = () => {
    setSent(true)
    setTimeout(() => {
      setOpen(false)
      setSent(false)
      setMessage("")
      onSubmitted?.()
    }, 1200)
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setOpen(true)}
        disabled={disabled}
      >
        <Send className="h-4 w-4 mr-2" />
        Solicitar renovación
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar renovación</DialogTitle>
            <DialogDescription>
              Envía una solicitud. El admin procesará la renovación después de confirmar el pago.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="renewal-message">Mensaje</Label>
            <Textarea
              id="renewal-message"
              placeholder="Indica el plan que necesitas o cualquier detalle relevante..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={sent}>
              Cancelar
            </Button>
            <Button onClick={submit} disabled={sent}>
              {sent ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Enviado
                </>
              ) : (
                "Enviar solicitud"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
