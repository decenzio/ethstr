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
      <div
        className="card bg-gradient-to-r from-primary via-secondary to-accent shadow-xl text-white w-full max-w-md mx-auto transition-transform duration-300 ease-out hover:scale-105"
        onMouseMove={e => {
          const card = e.currentTarget;
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = ((y - centerY) / centerY) * 3;
          const rotateY = ((x - centerX) / centerX) * -3;
          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
        }}
      >
        <div className="card-body p-8">
          <h2 className="card-title text-xl font-bold mb-4 text-center justify-center">Your Balance</h2>
          <div className="flex justify-center mb-6">
            <Balance address={walletAddress} className="text-3xl font-bold" />
          </div>
          <div className="card-actions justify-center">
            <WalletInteraction />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletCard;
