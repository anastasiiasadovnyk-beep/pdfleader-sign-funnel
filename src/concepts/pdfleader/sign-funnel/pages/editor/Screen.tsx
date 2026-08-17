import { useEffect } from 'react';

import { BaseDrawer } from '@universe-forma/ui-pes';

import { rememberSignatureType } from '../../lib/signatureChoice';
import type { EditorScreenProps } from './types';
import { useSignFunnelModel } from './hooks/useSignFunnelModel';
import { EditorHeader, PagesSidebar } from './components/EditorChrome';
import { MobileBottomNav, MobileTopBar } from './components/MobileChrome';
import { DocumentCanvas } from './components/DocumentCanvas';
import { SelectTypeModal } from './components/SelectTypeModal';
import { SignatureModal } from './components/SignatureModal';
import { SignContextToolbar } from './components/SignContextToolbar';
import { ExportPanel } from './components/ExportPanel';

/**
 * Editor page of the sign funnel: PDF editor with the Sign tool flow —
 * select sealing type → create signature (draw / type / upload) → signature
 * placed with the contextual toolbar. "Done" continues to the thank-you page.
 */
export default function Screen(props: EditorScreenProps) {
  const { state, actions, derived } = useSignFunnelModel(props);

  // The signed-document badge only exists once a signature is on the page:
  // green seal when it's verified, purple pending chip while it isn't.
  const pageBadge =
    state.step === 'signed' ? (state.verified ? 'seal' : 'pending') : null;

  /**
   * A pointer-down anywhere that is neither the placed signature nor its
   * toolbar clears the selection — both carry `data-signature-ui`, so the two
   * pieces of signature UI stay selectable while everything else deselects.
   */
  useEffect(() => {
    if (!derived.signatureActive) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-signature-ui]')) return;
      actions.deselectSignature();
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [derived.signatureActive, actions]);

  /** Done no longer leaves the editor — it opens the export panel. */
  const done = () => actions.openExport();

  /** Checkout hands the sealing choice on and continues to the thank-you page. */
  const proceedToCheckout = () => {
    rememberSignatureType(state.signatureType);
    props.onNext?.();
  };

  return (
    <div className="bg-bg-light-grey flex h-screen min-h-0 flex-col">
      <div className="max-md:hidden">
        <EditorHeader
          chrome={props.chrome}
          signToolActive={derived.signToolActive}
          onSignTool={actions.startSignFlow}
          onDone={done}
        />
      </div>
      <MobileTopBar
        copy={props.mobileChrome}
        onMenu={actions.openPages}
        onDone={done}
      />

      {derived.signatureActive && (
        <SignContextToolbar
          copy={props.signedToolbar}
          inkColor={state.inkColor}
          thickness={state.thickness}
          verified={state.verified}
          onInkColorChange={actions.setInkColor}
          onThicknessChange={actions.setThickness}
          onVerifiedChange={actions.toggleVerified}
          onEdit={actions.editSignature}
          onDelete={actions.deleteSignature}
        />
      )}

      <div className="flex min-h-0 flex-1">
        <div className="max-md:hidden">
          <PagesSidebar chrome={props.chrome} pageBadge={pageBadge} />
        </div>
        <DocumentCanvas
          document={props.document}
          signatureAssets={props.signatureAssets}
          inkColor={state.inkColor}
          placed={derived.signaturePlaced}
          placedMethod={derived.placedMethod}
          showSignId={derived.showSignId}
          signIdValue={props.signedToolbar.signIdValue}
          onSignField={actions.startSignFlow}
          selected={derived.signatureActive}
          onSelect={actions.selectSignature}
          signaturePosition={state.signaturePosition}
          onSignatureMove={actions.moveSignature}
        />
      </div>

      <MobileBottomNav
        copy={props.mobileChrome}
        signActive={derived.signToolActive}
        onSign={actions.startSignFlow}
      />

      {state.step === 'selectType' && (
        <SelectTypeModal
          copy={props.selectTypeModal}
          selected={state.signatureType}
          onSelect={actions.chooseType}
          onCancel={actions.cancelSelectType}
          onContinue={actions.continueToCreate}
        />
      )}

      {state.step === 'createSign' && (
        <SignatureModal
          copy={props.createSignModal}
          method={state.method}
          filled={state.filled[state.method]}
          inkColor={state.inkColor}
          thickness={state.thickness}
          assets={props.signatureAssets}
          canPlace={derived.canPlace}
          editing={state.editingPlaced}
          onBack={actions.backToSelectType}
          onClose={actions.closeCreate}
          onMethodChange={actions.setMethod}
          onInkColorChange={actions.setInkColor}
          onThicknessChange={actions.setThickness}
          onDraw={actions.draw}
          onType={actions.typeName}
          onUpload={actions.upload}
          onClear={actions.clear}
          onPlace={actions.placeSignature}
        />
      )}

      <ExportPanel
        copy={props.exportPanel}
        open={state.exportOpen}
        format={state.exportFormat}
        onFormatChange={actions.setExportFormat}
        onClose={actions.closeExport}
        onProceed={proceedToCheckout}
      />

      <BaseDrawer
        direction="left"
        open={state.pagesOpen}
        onOpenChange={(open) => (open ? actions.openPages() : actions.closePages())}
        overlayClassName="bg-common-black/50"
        className="bg-bg-white-bg h-full w-[214px] rounded-r-5"
      >
        <PagesSidebar chrome={props.chrome} pageBadge={pageBadge} />
      </BaseDrawer>
    </div>
  );
}
