import { Balance } from "../../scaffold-eth/Balance";
import { WalletInteraction } from "~~/components/import";
import { useGlobalState } from "~~/services/store/store";

const WalletCard = ({ className }: { className?: string }) => {
  const walletAddress = useGlobalState(state => state.walletAddress);
  if (!walletAddress) {
    return <p className="loading">No wallet connected.</p>;
  }

  return (
    <div className={className}>
      <div className="relative">
        <Balance
          address={walletAddress}
          // @ts-ignore
          render={({ isError }) => {
            let bgClasses = "bg-white pulse-size";
            if (isError) {
              bgClasses = "bg-red-500 opacity-50 transition-all scale-[1.4]";
            }

            return (
              <>
                <div className="absolute inset-0 flex items-center justify-center -z-10">
                  <div className={`w-[300px] h-[300px] rounded-full ${bgClasses} opacity-10`}></div>
                </div>
              </>
            );
          }}
        />
        <div
          className="card bg-gradient-to-r from-accent-content via-secondary/100 to-accent shadow-xl text-white w-110 transition-transform duration-300 ease-out"
          onMouseMove={e => {
            const card = e.currentTarget;
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * 4;
            const rotateY = ((x - centerX) / centerX) * -4;
            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg)";
          }}
        >
          <div className="card-body min-h-[250px]">
            <h2 className="card-title text-lg font-semibold opacity-80 tracking-wide">Wallet Balance</h2>
            <div className="tooltip tooltip-left" data-tip="Click to change currency">
              <Balance address={walletAddress} />
            </div>
            <div className="card-actions justify-end mt-auto">
              <WalletInteraction />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletCard;
