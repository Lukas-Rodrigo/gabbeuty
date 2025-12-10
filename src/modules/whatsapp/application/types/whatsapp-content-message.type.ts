export interface ContentMessage {
  text: string;
  buttons?: Button[];
}
interface ButtonText {
  displayText: string;
}

interface Button {
  buttonId: string;
  buttonText: ButtonText;
  type: number;
}
