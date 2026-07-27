export type CompressQualityIcon = 'high' | 'medium' | 'low' | 'custom';

export type CompressOption = {
  id: string;
  kind: 'preset' | 'custom';
  icon: CompressQualityIcon;
  title: string;
  description: string;
  projectedSize: string;
  savingsLabel: string;
  disabled?: boolean;
};

export type CompressResult = {
  optionId: string;
  customValue?: number;
};

export type CompressModalProps = {
  title: string;
  file: {
    name: string;
    size: string;
    sizeLabel: string;
    currentSizeLabel: string;
  };
  options: CompressOption[];
  initialSelectedId: string;
  initialCustomValue: number;
  customSizeRange: { minMb: number; maxMb: number };
  orLabel: string;
  customSliderLabel: string;
  sliderLeftLabel: string;
  sliderRightLabel: string;
  ctaLabelTemplate: string;
  onCompress: (result: CompressResult) => void;
  onClose: () => void;
};
